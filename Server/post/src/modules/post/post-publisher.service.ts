import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class PostPublisherService implements OnModuleInit {
  private channel: amqp.Channel;
  private readonly logger = new Logger(PostPublisherService.name);

  async onModuleInit() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await connection.createChannel();
    await this.channel.assertExchange('social-media', 'topic', {
      durable: true,
    });
    this.logger.log('✅ Connected to RabbitMQ and ready to publish.');
  }

  async publishPostCreated(payload: any) {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'posts.created', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`Sent posts.created event`);
  }

  async publishPostUpdated(payload: any) {
    
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'posts.updated', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`Sent posts.updated event`);
  }

  async publishPostDeleted(payload: any) {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'posts.deleted', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`Sent posts.deleted event: ${JSON.stringify(payload)}`);
  }
}
