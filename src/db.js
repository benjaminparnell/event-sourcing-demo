"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistEvents = exports.retrieveEvents = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dynamoClient = lib_dynamodb_1.DynamoDBDocument.from(new client_dynamodb_1.DynamoDBClient({ region: process.env.REGION }));
const eventTableName = process.env.EVENT_TABLE;
if (!eventTableName) {
    throw new Error("No event table name present");
}
const retrieveEvents = async (accountId) => {
    const queryResult = await dynamoClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: eventTableName,
        KeyConditionExpression: "accountId = :accountId",
        ExpressionAttributeValues: {
            ":accountId": accountId,
        },
    }));
    return (queryResult.Items ?? []);
};
exports.retrieveEvents = retrieveEvents;
const persistEvents = async (accountId, eventsToSave) => {
    // Build up the aggregate view of the account so we can get the right
    // version numbers on our new event
    const now = new Date().toISOString();
    const existingEvents = await (0, exports.retrieveEvents)(accountId);
    const eventsToSaveWithVersions = eventsToSave.map((event, index) => ({
        ...event,
        version: existingEvents.length + (index + 1),
        createdAt: now,
        accountId,
    }));
    // Add version numbers to each event in sequence.
    await dynamoClient.send(new lib_dynamodb_1.BatchWriteCommand({
        RequestItems: {
            [eventTableName]: [
                ...eventsToSaveWithVersions.map((event) => ({
                    PutRequest: { Item: event },
                })),
            ],
        },
    }));
};
exports.persistEvents = persistEvents;
