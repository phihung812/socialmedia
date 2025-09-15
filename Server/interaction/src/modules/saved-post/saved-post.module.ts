import { Module } from '@nestjs/common';
import { SavedPostsController } from './saved-post.controller';
import { SavedPostService } from './saved-post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedPost, SavedPostSchema } from './schema/savePost.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name : SavedPost.name, schema: SavedPostSchema}])
  ],
  controllers: [SavedPostsController],
  providers: [SavedPostService]
})
export class SavedPostModule {}
