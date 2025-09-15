import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ElasticsearchConfig } from './elasticsearch.config';
import { RabbitMQConfig } from './rabbitmq.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      load: [ElasticsearchConfig, RabbitMQConfig],
    }),
  ],
})
export class ConfigModule {}
