"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAggregate = void 0;
const reduceEvent = (account, event) => {
    const now = new Date().toISOString();
    switch (event.name) {
        case "AccountCreated": {
            return {
                accountId: event.payload.accountId,
                firstName: event.payload.firstName,
                lastName: event.payload.lastName,
                email: event.payload.email,
                updatedAt: now,
                createdAt: now,
            };
        }
        case "AccountEmailUpdated": {
            return {
                ...account,
                email: event.payload.email,
                updatedAt: now,
            };
        }
        default:
            throw new Error("Got an event that we do not know about");
    }
};
const buildAggregate = (events) => {
    return events.reduce((account, event) => reduceEvent(account, event), {});
};
exports.buildAggregate = buildAggregate;
