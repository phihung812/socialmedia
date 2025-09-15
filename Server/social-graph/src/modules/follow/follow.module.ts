import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from '../schema/follow.schema';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
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
    DatabaseModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
