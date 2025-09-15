import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './schema/like.schema';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async likedPostIds(currentUserId: string, postIds: string) {
    const likedPostIds = await this.likeModel
      .find({
        userId: currentUserId,
        postId: { $in: postIds },
      })
      .distinct('postId');

    return likedPostIds;
  }

  async checkIsLiked(currentUserId: string, postId: string): Promise<boolean> {
    const liked = await this.likeModel.exists({
      userId: currentUserId,
      postId: postId,
    });

    return Boolean(liked);
  }

  async createLikePost(postId: string, currentUserId: string) {
    const result = await this.likeModel.create({
      userId: currentUserId,
      postId,
    });

    const count = 1;
    this.postClient.emit({ cmd: 'update-countLike-post' }, { postId, count });

    const data = {
      senderId: currentUserId,
      type: 'like',
      entityType: 'post',
      referenceId: postId,
    };
    this.notificationClient.emit({ cmd: 'create-notification' }, data);

    return result;
  }

  async unLikePost(postId: string, currentUserId: string) {
    const result = await this.likeModel.findOneAndDelete({
      userId: currentUserId,
      postId,
    });
    const count = -1;
    this.postClient.emit({ cmd: 'update-countLike-post' }, { postId, count });
    return result;
  }
}
