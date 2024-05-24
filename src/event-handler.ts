import { persistEvents } from "./db";
import { AccountEventName, AccountEventPayload } from "./types";

interface IncomingEvent {
  name: AccountEventName;
  payload: AccountEventPayload;
}

export const handler = async (event: IncomingEvent) => {
  await persistEvents("1234", [
    {
      name: event.name,
      payload: event.payload,
    },
  ]);
};
