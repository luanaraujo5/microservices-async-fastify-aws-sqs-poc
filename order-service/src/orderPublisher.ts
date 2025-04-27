//#region Imports
import 'dotenv/config';
import AWS from 'aws-sdk';
//#endregion

//#region SQS Client Configuration
const sqs = new AWS.SQS({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.SQS_ENDPOINT
});
//#endregion

//#region Queue URL
const queueUrl = process.env.QUEUE_URL!;
//#endregion

/**
 * Esta função publica o objeto de pedido na fila SQS.
 * @param order - Objeto contendo orderId, userId e total.
 */
export async function publishOrder(order: any): Promise<void> {
  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(order)
    })
    .promise();
}
