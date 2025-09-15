import {
  Injectable,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { RabbitMQService } from '../../../shared/rabbitmq/rabbitmq.service';
import { UsersSearchService } from '../services/users-search.service';
import { ConsumeMessage } from 'amqplib';

interface UserEvent {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
    bio?: string;
    avatar?: {
        avatar_url?: string;
        avatar_public_id?: string;
    };
    isPrivate: boolean;
    isVerified: boolean;
    phoneNumber?: string;
    gender?: string;
    website?: string;
    location?: {
        country?: string;
        city?: string;
    };
    statistics: {
        postCount: number;
        followerCount: number;
        followingCount: number;
    };
    lastActive?: Date;
    accountStatus: 'active' | 'suspended' | 'deactivated';
    createdAt: Date;
    metadata: {
        timestamp: number;
        source: string;
        correlationId?: string;
    };
}

@Injectable()
export class UsersEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UsersEventsConsumer.name);
  private readonly exchange = 'social-media';
  private readonly queueName = 'search-service.users';
  private readonly deadLetterQueueName = 'search-service.users.failed';
  private isShuttingDown = false;
  private connectionCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly usersSearchService: UsersSearchService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing PostsEventsConsumer...');
    await this.rabbitMQService.waitUntilReady();
    await this.setupSubscriptions();
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }

  private async setupSubscriptions() {
    if (this.isShuttingDown) return;

    try {
      if (!this.rabbitMQService.isConnected()) {
        this.logger.warn(
          'RabbitMQ not connected, will retry when connection is established',
        );
        return;
      }

      await this.rabbitMQService.createExchange(this.exchange, 'topic', {
        durable: true,
      });

      await this.rabbitMQService.createExchange('dlx', 'direct', {
        durable: true,
      });
      await this.rabbitMQService.createQueue(this.deadLetterQueueName, {
        durable: true,
      });
      await this.rabbitMQService.bindQueue(
        this.deadLetterQueueName,
        'dlx',
        this.deadLetterQueueName,
      );

      await this.rabbitMQService.createQueue(this.queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'dlx',
          'x-dead-letter-routing-key': this.deadLetterQueueName,
        },
      });

      await this.rabbitMQService.bindQueue(
        this.queueName,
        this.exchange,
        'users.#',
      );

      await this.rabbitMQService.consume(
        this.queueName,
        this.handleMessage.bind(this),
        {
          noAck: false,
        },
      );

      this.logger.log(`Subscribed to users events on queue: ${this.queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to set up users events consumer: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const routingKey = msg.fields.routingKey;
    this.logger.debug(`Received message with routing key: ${routingKey}`);

    try {
      const contentStr = msg.content.toString();
      const content = JSON.parse(contentStr) as UserEvent;

      if (!this.isValidUserEvent(content, routingKey)) {
        this.logger.warn(
          `Invalid message format for ${routingKey}: ${contentStr}`,
        );
        throw new Error('Invalid message format');
      }

      await this.processEvent(routingKey, content);
      this.logger.debug(`Processed message with routing key: ${routingKey}`);
    } catch (error) {
      this.logger.error(
        `Error processing ${routingKey}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private isValidUserEvent(content: any, routingKey: string): boolean {
    return (
      !!content &&
      typeof content === 'object' &&
      !!content._id &&
      !!content.username &&
      !!content.email &&
      typeof content.isPrivate === 'boolean' &&
      typeof content.isVerified === 'boolean' &&
      !!content.accountStatus &&
      ['active', 'suspended', 'deactivated'].includes(content.accountStatus)
    );
  }

  private async processEvent(routingKey: string, content: UserEvent) {
    this.logger.log(`Handling ${routingKey} event for users: ${content._id}`);

    switch (routingKey) {
      case 'users.created':
        this.logger.log('users.created event');
        await this.usersSearchService.indexUser(content);
        break;
      case 'users.updated':
        this.logger.log('users.updated event');
        await this.usersSearchService.updateUser(content._id, content);
        break;
      case 'users.deleted':
        await this.usersSearchService.deleteUser(content._id);
        break;
      default:
        this.logger.warn(`Unhandled routing key: ${routingKey}`);
    }
  }
}
