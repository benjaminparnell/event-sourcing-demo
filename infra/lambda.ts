import { join } from "path";
import { Duration } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

export class EventHandler extends NodejsFunction {
  constructor(stack: Construct, eventTable: ITable) {
    super(stack, EventHandler.name, {
      entry: join(__dirname, "..", "src", "event-handler.ts"),
      memorySize: 512,
      timeout: Duration.seconds(10),
      environment: {
        EVENT_TABLE: eventTable.tableName,
      },
    });

    eventTable.grantReadWriteData(this);
  }
}
