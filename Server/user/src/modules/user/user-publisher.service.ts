import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class UserPublisherService implements OnModuleInit {
  private channel: amqp.Channel;
  private readonly logger = new Logger(UserPublisherService.name);

  async onModuleInit() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await connection.createChannel();
    await this.channel.assertExchange('social-media', 'topic', {
      durable: true,
    });
    this.logger.log('✅ Connected to RabbitMQ and ready to publish.');
  }

  async publishUserCreated(payload: any) {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'users.created', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`📤 Sent users.created event: ${JSON.stringify(payload)}`);
  }

  async publishUserUpdated(payload: any) {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'users.updated', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`Đã gửi sự kiện cập nhật user lên elasticsearch: ${JSON.stringify(payload)}`);
  }

  async publishUserDeleted(payload: any) {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish('social-media', 'users.deleted', message, {
      persistent: true,
      contentType: 'application/json',
    });
    this.logger.log(`📤 Sent users.deleted event: ${JSON.stringify(payload)}`);
  }
}
