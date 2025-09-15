import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UploadfileModule } from '../uploadfile/uploadfile.module';
import { UserPublisherService } from './user-publisher.service';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
        name: 'MESSAGE_SERVICE',
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
              queue: 'message_queue',
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
            throw new Error('Missing required RABBITMQ_URL env variable');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'feed_queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),

    UploadfileModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserPublisherService],
  exports: [UserService],
})
export class UserModule {}
