import { App, Stack } from "aws-cdk-lib";
import { EventHandler } from "./lambda";
import { EventTable } from "./dynamodb";

const app = new App();

const env = {
  account: "",
  region: "eu-west-2",
};

class EventStack extends Stack {
  constructor(app: App) {
    super(app, EventStack.name, { env });

    const eventTable = new EventTable(this);

    new EventHandler(this, eventTable);
  }
}

new EventStack(app);

app.synth();
