import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { IndexManagerService } from './elasticsearch/index-manager.service';
import { QueryBuilder } from './utils/query-builder';
import { ResultFormatter } from './utils/result-formatter';

@Module({
  imports: [ConfigModule, ElasticsearchModule, RabbitMQModule],
  providers: [IndexManagerService, QueryBuilder, ResultFormatter],
  exports: [
    ConfigModule,
    ElasticsearchModule,
    RabbitMQModule,
    IndexManagerService,
    QueryBuilder,
    ResultFormatter,
  ],
})
export class SharedModule {}
