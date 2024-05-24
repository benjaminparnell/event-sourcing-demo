import {
  DynamoDBDocument,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { AccountEvent, SubmittedAccountEvent } from "./types";

const dynamoClient = DynamoDBDocument.from(
  new DynamoDBClient({ region: process.env.REGION })
);

const eventTableName = process.env.EVENT_TABLE;

if (!eventTableName) {
  throw new Error("No event table name present");
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

  // Add version numbers to each event in sequence.
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
};
