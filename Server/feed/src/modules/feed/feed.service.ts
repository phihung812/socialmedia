import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Feed, FeedDocument } from './schema/feed.schema';
import { Model } from 'mongoose';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Feed.name) private feedModel: Model<FeedDocument>,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
  ) {}

  async create(userId: string) {
    return await this.feedModel.create({ userId });
  }
}
