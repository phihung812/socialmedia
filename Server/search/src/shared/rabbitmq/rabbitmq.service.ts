import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';


@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly reconnectAttempts = 5;
  private readonly reconnectInterval = 5000;
  private consumers: Map<
    string,
    (msg: amqp.ConsumeMessage) => Promise<void> | void
  > = new Map();
  private consumerTags: Map<string, string> = new Map();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.safeDisconnect();
  }

  async waitUntilReady(timeout = 5000): Promise<void> {
    const interval = 100;
    let waited = 0;

    while (!this.channel && waited < timeout) {
      await new Promise((res) => setTimeout(res, interval));
      waited += interval;
    }

    if (!this.channel) {
      throw new Error('RabbitMQ channel not ready after waiting');
    }
  }

  private async connect(attempt = 1): Promise<void> {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      if (!url) {
        throw new Error('RABBITMQ_URL is not defined');
      }
      this.logger.log(`Connecting to RabbitMQ at ${this.maskUrl(url)}`);

      this.connection = await amqp.connect(url);

      this.connection.on('error', (err) => {
        this.logger.error(
          `RabbitMQ connection error: ${err.message}`,
          err.stack,
        );
      });

      this.connection.on('close', () => {
        this.logger.warn(
          'RabbitMQ connection closed, attempting to reconnect...',
        );
        setTimeout(() => this.reconnect(), 1000);
      });

      this.channel = await this.connection.createChannel();

      this.channel.on('error', (err) => {
        this.logger.error(`RabbitMQ channel error: ${err.message}`, err.stack);
      });

      this.channel.on('close', () => {
        this.logger.warn('RabbitMQ channel closed');

        if (
          this.connection &&
          this.connection.connection &&
          this.connection.connection.heartbeat
        ) {
          this.recreateChannel();
        }
      });

      const prefetchCount =
        this.configService.get<number>('RABBITMQ_PREFETCH_COUNT') || 10;
      await this.channel.prefetch(prefetchCount);

      this.logger.log('Successfully connected to RabbitMQ');

      if (this.consumers.size > 0) {
        await this.restoreConsumers();
      }
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error.message}`,
        error.stack,
      );

      if (attempt <= this.reconnectAttempts) {
        this.logger.log(
          `Retrying connection (${attempt}/${this.reconnectAttempts}) in ${this.reconnectInterval / 1000}s...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, this.reconnectInterval),
        );
        return this.connect(attempt + 1);
      } else {
        this.logger.error(
          `Failed to connect to RabbitMQ after ${this.reconnectAttempts} attempts`,
        );
        throw error;
      }
    }
  }

  private async recreateChannel(): Promise<void> {
    try {
      if (this.connection && this.connection.connection) {
        this.logger.log('Recreating RabbitMQ channel');
        this.channel = await this.connection.createChannel();

        this.channel.on('error', (err) => {
          this.logger.error(
            `RabbitMQ channel error: ${err.message}`,
            err.stack,
          );
        });

        this.channel.on('close', () => {
          this.logger.warn('RabbitMQ channel closed');
          if (
            this.connection &&
            this.connection.connection &&
            this.connection.connection.heartbeat
          ) {
            this.recreateChannel();
          }
        });

        const prefetchCount =
          this.configService.get<number>('RABBITMQ_PREFETCH_COUNT') || 10;
        await this.channel.prefetch(prefetchCount);

        await this.restoreConsumers();

        this.logger.log('Successfully recreated RabbitMQ channel');
      } else {
        this.logger.warn(
          'Cannot recreate channel, connection is not available',
        );
        await this.reconnect();
      }
    } catch (error) {
      this.logger.error(
        `Failed to recreate RabbitMQ channel: ${error.message}`,
        error.stack,
      );
      await this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    try {
      if (this._isReconnecting) {
        return;
      }

      this._isReconnecting = true;

      this.logger.warn('RabbitMQ reconnection started');

      await this.safeDisconnect();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.connect();

      this._isReconnecting = false;
    } catch (error) {
      this._isReconnecting = false;
      this.logger.error(
        `Error during RabbitMQ reconnection: ${error.message}`,
        error.stack,
      );

      setTimeout(() => this.reconnect(), this.reconnectInterval);
    }
  }

  private _isReconnecting = false;

  private async safeDisconnect(): Promise<void> {
    try {
      if (this.channel && this.consumerTags.size > 0) {
        for (const [queue, tag] of this.consumerTags.entries()) {
          try {
            await this.channel.cancel(tag);
            this.logger.log(`Cancelled consumer for queue: ${queue}`);
          } catch (err) {
            this.logger.warn(
              `Failed to cancel consumer for queue ${queue}: ${err.message}`,
            );
          }
        }
      }

      if (this.channel) {
        try {
          this.logger.log('Closing RabbitMQ channel');
          await this.channel.close();
        } catch (error) {
          this.logger.warn(`Error closing RabbitMQ channel: ${error.message}`);
        }
      }

      if (this.connection) {
        try {
          this.logger.log('Closing RabbitMQ connection');
          await this.connection.close();
        } catch (error) {
          this.logger.warn(
            `Error closing RabbitMQ connection: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error during safe disconnect: ${error.message}`,
        error.stack,
      );
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }

  private async restoreConsumers(): Promise<void> {
    if (this.consumers.size === 0) {
      return;
    }

    this.logger.log(`Restoring ${this.consumers.size} consumers`);

    const consumerEntries = Array.from(this.consumers.entries());
    for (const [queue, callback] of consumerEntries) {
      try {
        this.logger.log(`Restoring consumer for queue: ${queue}`);
        await this.consume(queue, callback);
      } catch (error) {
        this.logger.error(
          `Failed to restore consumer for queue ${queue}: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.password) {
        urlObj.password = '****';
      }
      return urlObj.toString();
    } catch {
      return 'Invalid URL format';
    }
  }

  isConnected(): boolean {
    return !!(this.connection && this.channel);
  }

  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }
    return this.channel;
  }

  async createExchange(
    exchange: string,
    type: string = 'topic',
    options: amqp.Options.AssertExchange = {},
  ) {
    if (!this.channel) {
      this.logger.error(
        `Channel is not ready when calling createExchange: ${exchange}`,
      );
      return;
    }

    try {
      this.logger.log(`➡️ Asserting exchange: ${exchange} (${type})`);
      await this.channel.assertExchange(exchange, type, {
        durable: true,
        ...options,
      });
      this.logger.log(`Exchange created: ${exchange}`);
    } catch (err) {
      this.logger.error(
        `Failed to create exchange: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async createQueue(queue: string, options: amqp.Options.AssertQueue = {}) {
    if (!this.channel) {
      await this.reconnect();
    }

    this.logger.log(`Creating or asserting queue: ${queue}`);

    return this.channel.assertQueue(queue, {
      durable: true,
      ...options,
    });
  }

  async bindQueue(queue: string, exchange: string, routingKey: string) {
    if (!this.channel) {
      await this.reconnect();
    }

    this.logger.log(
      `Binding queue ${queue} to exchange ${exchange} with routing key: ${routingKey}`,
    );
    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  async consume(
    queue: string,
    callback: (msg: amqp.ConsumeMessage) => Promise<void> | void,
    options: amqp.Options.Consume = {},
  ) {
    if (!this.channel) {
      await this.reconnect();
    }

    // Save the consumer for reconnection scenarios
    this.consumers.set(queue, callback);

    this.logger.log(`Setting up consumer for queue: ${queue}`);

    try {
      const { consumerTag } = await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) {
            this.logger.warn(`Received null message from queue ${queue}`);
            return;
          }

          try {
            this.logger.debug(`Received message from queue ${queue}`);
            await Promise.resolve(callback(msg));

            if (this.channel) {
              try {
                this.channel.ack(msg);
              } catch (ackError) {
                this.logger.error(
                  `Error acknowledging message: ${ackError.message}`,
                  ackError.stack,
                );
                if (
                  ackError.message.includes('channel closed') ||
                  ackError.message.includes('unknown delivery tag')
                ) {
                  await this.reconnect();
                }
              }
            } else {
              this.logger.warn(
                'Cannot acknowledge message, channel is not available',
              );
              await this.reconnect();
            }
          } catch (error) {
            this.logger.error(
              `Error processing message: ${error.message}`,
              error.stack,
            );

            if (this.channel) {
              try {
                this.channel.nack(msg, false, false);
              } catch (nackError) {
                this.logger.error(
                  `Error rejecting message: ${nackError.message}`,
                  nackError.stack,
                );
                if (
                  nackError.message.includes('channel closed') ||
                  nackError.message.includes('unknown delivery tag')
                ) {
                  await this.reconnect();
                }
              }
            } else {
              this.logger.warn(
                'Cannot reject message, channel is not available',
              );
              await this.reconnect();
            }
          }
        },
        { ...options },
      );

      this.consumerTags.set(queue, consumerTag);
      this.logger.log(
        `Successfully subscribed to ${queue} events on queue: ${queue}`,
      );

      return consumerTag;
    } catch (error) {
      this.logger.error(
        `Failed to setup consumer for queue ${queue}: ${error.message}`,
        error.stack,
      );

      if (
        error.message.includes('channel closed') ||
        error.message.includes('connection closed')
      ) {
        await this.reconnect();
      }

      throw error;
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    content: any,
    options: amqp.Options.Publish = {},
  ) {
    if (!this.channel) {
      await this.reconnect();
    }

    try {
      const message = Buffer.from(
        typeof content === 'string' ? content : JSON.stringify(content),
      );

      const published = this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        contentType: 'application/json',
        ...options,
      });

      if (published) {
        this.logger.debug(
          `Message published to exchange ${exchange} with routing key ${routingKey}`,
        );
      } else {
        this.logger.warn(
          `Publish buffer full, waiting for drain event on exchange ${exchange}`,
        );
        await new Promise((resolve) => this.channel.once('drain', resolve));
        this.logger.debug(
          `Buffer drained, message published to exchange ${exchange}`,
        );
      }

      return published;
    } catch (error) {
      this.logger.error(
        `Failed to publish message: ${error.message}`,
        error.stack,
      );

      if (
        error.message.includes('channel closed') ||
        error.message.includes('connection closed')
      ) {
        await this.reconnect();
        return this.publish(exchange, routingKey, content, options);
      }

      throw error;
    }
  }

  async sendToQueue(
    queue: string,
    content: any,
    options: amqp.Options.Publish = {},
  ) {
    if (!this.channel) {
      await this.reconnect();
    }

    try {
      const message = Buffer.from(
        typeof content === 'string' ? content : JSON.stringify(content),
      );

      const sent = this.channel.sendToQueue(queue, message, {
        persistent: true,
        contentType: 'application/json',
        ...options,
      });

      if (sent) {
        this.logger.debug(`Message sent directly to queue ${queue}`);
      } else {
        this.logger.warn(
          `Send buffer full, waiting for drain event on queue ${queue}`,
        );
        await new Promise((resolve) => this.channel.once('drain', resolve));
        this.logger.debug(`Buffer drained, message sent to queue ${queue}`);
      }

      return sent;
    } catch (error) {
      this.logger.error(
        `Failed to send message to queue: ${error.message}`,
        error.stack,
      );

      if (
        error.message.includes('channel closed') ||
        error.message.includes('connection closed')
      ) {
        await this.reconnect();
        return this.sendToQueue(queue, content, options);
      }

      throw error;
    }
  }

  async deleteQueue(queue: string, options: amqp.Options.DeleteQueue = {}) {
    if (!this.channel) {
      await this.reconnect();
    }

    this.consumers.delete(queue);
    this.consumerTags.delete(queue);

    this.logger.log(`Deleting queue: ${queue}`);
    return this.channel.deleteQueue(queue, options);
  }

  async deleteExchange(
    exchange: string,
    options: amqp.Options.DeleteExchange = {},
  ) {
    if (!this.channel) {
      await this.reconnect();
    }

    this.logger.log(`Deleting exchange: ${exchange}`);
    return this.channel.deleteExchange(exchange, options);
  }

  async checkQueue(queue: string): Promise<boolean> {
    if (!this.channel) {
      await this.reconnect();
    }

    try {
      await this.channel.checkQueue(queue);
      return true;
    } catch (error) {
      if (error.code === 404) {
        return false; 
      }
      this.logger.error(`Error checking queue ${queue}: ${error.message}`);
      throw error;
    }
  }
}
