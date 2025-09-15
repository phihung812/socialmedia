import { Module } from '@nestjs/common';
import { PostsSearchController } from './controllers/posts-search.controller';
import { PostsSearchService } from './services/posts-search.service';
import { PostsEventsConsumer } from './consumers/posts-events.consumer';
import { SharedModule } from '../../shared/shared.module';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { ResultFormatter } from 'src/shared/utils/result-formatter';

@Module({
  imports: [SharedModule],
  controllers: [PostsSearchController],
  providers: [PostsSearchService, PostsEventsConsumer, QueryBuilder, ResultFormatter],
  exports: [PostsSearchService],
})
export class PostsModule {}
