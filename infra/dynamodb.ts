import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class EventTable extends Table {
  constructor(stack: Construct) {
    super(stack, EventTable.name, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "accountId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "version",
        type: AttributeType.NUMBER,
      },
    });
  }
}
