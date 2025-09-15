import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConversationModule } from '../conversation/conversation.module';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'message_exchange',
            type: 'topic',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URL')!,
        connectionInitOptions: { wait: false },
      }),
    }),
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
    ConversationModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
