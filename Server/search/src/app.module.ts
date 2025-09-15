import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
// import { CommentsModule } from './modules/comments/comments.module';
// import { TagsModule } from './modules/tags/tags.module';
import { GlobalSearchModule } from './modules/global-search/global-search.module';
// import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Shared modules
    SharedModule,

    // Domain modules
    UsersModule,
    PostsModule,
    // CommentsModule,
    // TagsModule,
    GlobalSearchModule,

    // Health checks
    // HealthModule,
  ],
})
export class AppModule {}
