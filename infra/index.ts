import { App, Stack } from "aws-cdk-lib";
import { EventHandler } from "./lambda";
import { EventTable, SnapshotTable } from "./dynamodb";

const app = new App();

const env = {
  region: "eu-west-2",
};

class EventStack extends Stack {
  constructor(app: App) {
    super(app, EventStack.name, { env });

    const eventTable = new EventTable(this);
    const snapshotTable = new SnapshotTable(this);

    new EventHandler(this, eventTable, snapshotTable);
  }
}

new EventStack(app);

app.synth();
