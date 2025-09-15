import { Module, Global } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ElasticsearchConfig } from '../config/elasticsearch.config';
import { ElasticsearchService } from './elasticsearch.service';
import { IndexManagerService } from './index-manager.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ElasticsearchConfig.KEY],
      useFactory: (config: ConfigType<typeof ElasticsearchConfig>) => {
        return {
          node: config.node,
          auth: {
            username: config.username,
            password: config.password,
          },
          maxRetries: config.maxRetries,
          requestTimeout: config.requestTimeout,
        };
      },
    }),
  ],
  providers: [ElasticsearchService, IndexManagerService],
  exports: [NestElasticsearchModule, ElasticsearchService, IndexManagerService],
})
export class ElasticsearchModule {}
