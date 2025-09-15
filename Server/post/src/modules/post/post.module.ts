import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { UploadfileModule } from '../uploadfile/uploadfile.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostPublisherService } from './post-publisher.service';
import { RmqOptions } from '@nestjs/microservices';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UploadfileModule,
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService,
        ): Promise<RmqOptions> => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('Missing RABBITMQ_URL');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue:
                configService.get<string>('RABBITMQ_USER_QUEUE') ||
                'user_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'INTERACTION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService,
        ): Promise<RmqOptions> => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('Missing required RABBITMQ_URL env variable');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'interaction_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'FOLLOW_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService,
        ): Promise<RmqOptions> => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('Missing required RABBITMQ_URL env variable');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'follow_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'FEED_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService,
        ): Promise<RmqOptions> => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('Missing RABBITMQ_URL');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue:
                configService.get<string>('RABBITMQ_FEED_QUEUE') ||
                'feed_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, PostPublisherService],
})
export class PostModule {}
