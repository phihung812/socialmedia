import { Module } from '@nestjs/common';
import { GlobalSearchController } from './controllers/global-search.controller';
import { GlobalSearchService } from './services/global-search.service';
import { ElasticsearchModule } from '../../shared/elasticsearch/elasticsearch.module';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { ClientsModule, RmqOptions } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
// import { CommentsModule } from '../comments/comments.module';
// import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
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
    ElasticsearchModule,
    UsersModule,
    PostsModule,
    // CommentsModule,
    // TagsModule,
  ],
  controllers: [GlobalSearchController],
  providers: [GlobalSearchService, QueryBuilder],
  exports: [GlobalSearchService],
})
export class GlobalSearchModule {}
