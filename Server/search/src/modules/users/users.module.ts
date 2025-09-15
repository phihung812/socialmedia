import { Module } from '@nestjs/common';
import { UsersSearchController } from './controllers/users-search.controller';
import { UsersSearchService } from './services/users-search.service';
import { UsersEventsConsumer } from './consumers/users-events.consumer';
import { SharedModule } from '../../shared/shared.module';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { ResultFormatter } from 'src/shared/utils/result-formatter';

@Module({
  imports: [SharedModule],
  controllers: [UsersSearchController],
  providers: [UsersSearchService, UsersEventsConsumer, QueryBuilder, ResultFormatter],
  exports: [UsersSearchService],
})
export class UsersModule {}
