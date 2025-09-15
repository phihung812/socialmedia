import { registerAs } from '@nestjs/config';

export const RabbitMQConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  queue: process.env.RABBITMQ_QUEUE,
  exchange: process.env.RABBITMQ_EXCHANGE || 'social-media',
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
  routingKey: process.env.RABBITMQ_ROUTING_KEY || 'posts.#',
  prefetchCount: 10,
}));


