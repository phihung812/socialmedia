import {
  Injectable,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { RabbitMQService } from '../../../shared/rabbitmq/rabbitmq.service';
import { PostsSearchService } from '../services/posts-search.service';
import { ConsumeMessage } from 'amqplib';

interface PostEvent {
  _id: string;
  userId: string;
  caption: string;
  author: {
    userId: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  images: {
    image_url: string;
    image_public_id: string;
    _id: string;
  }[];
  tags?: string[];
  privacy?: string;
  statistics?: {
    likeCount: number;
    commentCount: number;
  };
  mentionedUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PostsEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostsEventsConsumer.name);
  private readonly exchange = 'social-media';
  private readonly queueName = 'search-service.posts';
  private readonly deadLetterQueueName = 'search-service.posts.failed';
  private isShuttingDown = false;
  private connectionCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly postsSearchService: PostsSearchService,
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
        'posts.#',
      );

      await this.rabbitMQService.consume(
        this.queueName,
        this.handleMessage.bind(this),
        {
          noAck: false,
        },
      );

      this.logger.log(
        `Subscribed to posts events on queue: ${this.queueName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set up posts events consumer: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const routingKey = msg.fields.routingKey;
    this.logger.debug(`Received message with routing key: ${routingKey}`);

    try {
      const contentStr = msg.content.toString();
      const content = JSON.parse(contentStr) as PostEvent;

      if (!this.isValidPostEvent(content, routingKey)) {
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

  private isValidPostEvent(content: any, routingKey: string): boolean {
    return (
      !!content &&
      typeof content === 'object' &&
      !!content._id &&
      !!content.userId &&
      !!content.caption &&
      !!content.author?.userId &&
      Array.isArray(content.images)
    );
  }

  private async processEvent(routingKey: string, content: PostEvent) {
    this.logger.log(`Handling ${routingKey} event for post: ${content._id}`);    

    switch (routingKey) {
      case 'posts.created':
        this.logger.log('posts.created event');
        await this.postsSearchService.indexPost(content);
        break;
      case 'posts.updated':
        this.logger.log('posts.updated event');
        await this.postsSearchService.updatePost(content._id, content);
        break;
      case 'posts.deleted':
        await this.postsSearchService.deletePost(content._id);
        break;
      default:
        this.logger.warn(`⚠️ Unhandled routing key: ${routingKey}`);
    }
  }
}
