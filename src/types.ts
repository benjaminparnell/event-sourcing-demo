export interface Account {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  updatedAt: string;
  createdAt: string;
}

export interface AccountSnapshot extends Account {
  version: number;
}

export type AccountEventName = "AccountCreated" | "AccountEmailUpdated";

interface AccountEventBase<Name extends AccountEventName, Payload> {
  accountId: string;
  name: Name;
  payload: Payload;
  version: number;
  createdAt: string;
}

export interface AccountCreatedPayload {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type AccountCreated = AccountEventBase<
  "AccountCreated",
  AccountCreatedPayload
>;

export interface AccountEmailUpdatedPayload {
  email: string;
}

export type AccountEmailUpdated = AccountEventBase<
  "AccountEmailUpdated",
  AccountEmailUpdatedPayload
>;

export type AccountEventPayload =
  | AccountCreatedPayload
  | AccountEmailUpdatedPayload;
export type AccountEvent = AccountCreated | AccountEmailUpdated;

export interface SubmittedAccountEvent {
  name: AccountEventName;
  payload: AccountEventPayload;
}
