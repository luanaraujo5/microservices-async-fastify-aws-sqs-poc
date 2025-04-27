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
const queueUrl = process.env.QUEUE_URL!;
//#endregion

/**
 * Esta função consome mensagens da fila SQS em loop contínuo,
 * processa cada pedido simulando o pagamento e deleta a mensagem.
 */
async function consumeMessages(): Promise<void> {
  while (true) {
    try {
      const response = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
      }).promise();

      const messages = response.Messages;
      if (!messages || messages.length === 0) {
        continue;
      }

      for (const msg of messages) {
        const order = JSON.parse(msg.Body!);
        console.log(`Processing payment for order ${order.orderId}...`);
        // Simula tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Payment processed for order ${order.orderId}`);

        // Deleta mensagem após processamento
        await sqs.deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle!
        }).promise();
      }
    } catch (error) {
      console.error('Erro ao consumir mensagens:', error);
      // Aguarda antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

//#region App Start
consumeMessages().catch(err => {
  console.error('Fatal error in consumer:', err);
  process.exit(1);
});
//#endregion
