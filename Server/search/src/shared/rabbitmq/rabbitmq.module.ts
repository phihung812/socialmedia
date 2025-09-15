import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RabbitMQService } from './rabbitmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQConfig } from '../config/rabbitmq.config';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        inject: [RabbitMQConfig.KEY],
        useFactory: (rabbitConfig: ConfigType<typeof RabbitMQConfig>) => {
          if (!rabbitConfig.url) {
            throw new Error('RabbitMQ URL is not defined!');
          }          

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitConfig.url],
              queue: rabbitConfig.queue || 'search-service.posts',
              queueOptions: {
                durable: true, 
                maxPriority: 10, 
              },
              exchange: rabbitConfig.exchange,
              exchangeType: rabbitConfig.exchangeType,
              prefetchCount: rabbitConfig.prefetchCount || 100,
              persistent: true, 
              noAck: false, 
            },
          };
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
