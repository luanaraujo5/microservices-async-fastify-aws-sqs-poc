//#region Imports
import 'dotenv/config';
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { v4 as uuidv4 } from 'uuid';
import { publishOrder } from './orderPublisher';
//#endregion

async function buildApp() {
  const app = Fastify({ logger: true });

  //#region Swagger Configuration
  /**
   * Esta função registra e configura o Swagger/OpenAPI para
   * gerar documentação interativa da API.
   */
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Order Service API',
        description: 'API para criação de pedidos e publicação em SQS',
        version: '1.0.0'
      },
      servers: [{ url: `http://localhost:${process.env.PORT}` }]
    }
  });
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
    staticCSP: true
  });
  //#endregion

  //#region Routes
  /**
   * Esta rota recebe requisições para criação de pedidos,
   * valida os dados de entrada, gera um UUID v4,
   * publica a mensagem no SQS e retorna a confirmação.
   */
  app.post('/orders', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'total'],
        properties: {
          userId: { type: 'string', description: 'ID do usuário' },
          total:  { type: 'number', description: 'Valor total do pedido' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            order: {
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                userId:  { type: 'string' },
                total:   { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { userId, total } = request.body as { userId: string; total: number };
    if (!userId || typeof total !== 'number') {
      return reply.status(400).send({ error: 'userId and total are required' });
    }

    const order = {
      orderId: uuidv4(),
      userId,
      total
    };

    await publishOrder(order);
    return reply.status(201).send({ status: 'Order created', order });
  });
  //#endregion

  return app;
}

//#region App Initialization
buildApp()
  .then(app => {
    app.listen({ port: Number(process.env.PORT), host: '0.0.0.0' })
      .then(() => app.log.info(`Order Service listening on port ${process.env.PORT}`))
      .catch(err => { app.log.error(err); process.exit(1); });
  })
  .catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
//#endregion
