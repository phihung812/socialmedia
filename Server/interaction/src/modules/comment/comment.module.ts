import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'POST_SERVICE',
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
              queue: 'post_queue',
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
        name: 'NOTIFICATION_SERVICE',
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
              queue: 'notification_queue',
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
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
