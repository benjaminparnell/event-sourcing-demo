import { Account, AccountEvent } from "./types";

const reduceEvent = (account: Account, event: AccountEvent): Account => {
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

export const buildAggregate = (events: AccountEvent[]): Account => {
  return events.reduce<Account>(
    (account, event) => reduceEvent(account, event),
    {} as Account
  );
};
