import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
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
        name: 'USER_SERVICE',
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
              queue: 'user_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
