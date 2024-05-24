import {
  DynamoDBDocument,
  QueryCommand,
  BatchWriteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  Account,
  AccountEvent,
  AccountSnapshot,
  SubmittedAccountEvent,
} from "./types";
import { buildAggregate } from "./aggregate-events";

const dynamoClient = DynamoDBDocument.from(
  new DynamoDBClient({ region: process.env.REGION })
);

const eventTableName = process.env.EVENT_TABLE;
const snapshotTableName = process.env.SNAPSHOT_TABLE;

if (!eventTableName) {
  throw new Error("No event table name present");
}

if (!snapshotTableName) {
  throw new Error("No snapshot table name present");
}

export const retrieveEvents = async (
  accountId: string
): Promise<AccountEvent[]> => {
  const queryResult = await dynamoClient.send(
    new QueryCommand({
      TableName: eventTableName,
      KeyConditionExpression: "accountId = :accountId",
      ExpressionAttributeValues: {
        ":accountId": accountId,
      },
    })
  );

  return (queryResult.Items ?? []) as AccountEvent[];
};

export const persistEvents = async (
  accountId: string,
  eventsToSave: SubmittedAccountEvent[]
) => {
  // Build up the aggregate view of the account so we can get the right
  // version numbers on our new event
  const now = new Date().toISOString();
  const existingEvents = await retrieveEvents(accountId);
  const eventsToSaveWithVersions = eventsToSave.map((event, index) => ({
    ...event,
    version: existingEvents.length + (index + 1),
    createdAt: now,
    accountId,
  }));

  // Save the events to the event table
  await dynamoClient.send(
    new BatchWriteCommand({
      RequestItems: {
        [eventTableName]: [
          ...eventsToSaveWithVersions.map((event) => ({
            PutRequest: { Item: event },
          })),
        ],
      },
    })
  );

  const account = buildAggregate([
    ...existingEvents,
    ...(eventsToSaveWithVersions as AccountEvent[]), // TODO weird type error?
  ]);

  const snapshotResult = await dynamoClient.send(
    new QueryCommand({
      TableName: snapshotTableName,
      KeyConditionExpression: "accountId = :accountId",
      ExpressionAttributeValues: {
        ":accountId": accountId,
      },
    })
  );

  const snapshot = snapshotResult.Items?.at(0) as AccountSnapshot;
  const currentVersion = snapshot ? snapshot.version : 0;
  const accountWithNewVersion = {
    ...account,
    version: currentVersion + 1,
  };

  // Now save the new snapshot
  await dynamoClient.send(
    new PutCommand({
      TableName: snapshotTableName,
      Item: accountWithNewVersion,
      ...(snapshot
        ? {
            ConditionExpression: "#version = :currentVersion",
            ExpressionAttributeNames: {
              "#version": "version",
            },
            ExpressionAttributeValues: {
              ":currentVersion": currentVersion,
            },
          }
        : {}),
    })
  );
};
