import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow, FollowDocument } from '../schema/follow.schema';
import { Model, Types } from 'mongoose';
import { DatabaseService } from 'src/database/database.service';
import { ConflictException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private readonly databaseService: DatabaseService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  async healthyDatabase() {
    return await this.databaseService.checkConnection();
  }

  async createFollow(followingId: string, followerId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Bạn không thể theo dõi chính mình.');
    }

    const existing = await this.followModel.findOne({
      followerId,
      followingId,
    });

    if (existing) {
      throw new ConflictException('Bạn đã gửi yêu cầu theo dõi trước đó.');
    }

    const follow = new this.followModel({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
      status: 'accepted',
    });

    this.userClient.emit('user-follow', { followerId: followerId });
    follow.save();

    const data = {
      senderId: followingId,
      type: 'follow',
      entityType: 'user',
      referenceId: followingId,
      receiverId: followerId,
    };
    this.notificationClient.emit({ cmd: 'create-notification' }, data);
    return {
      message: 'Đã follow người dùng này',
    };
  }

  async unFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Bạn không thể hủy theo dõi chính mình.');
    }

    const deleted = await this.followModel.findOneAndDelete({
      followingId: new Types.ObjectId(followingId),
      followerId: new Types.ObjectId(followerId),
    });

    if (!deleted) {
      throw new NotFoundException('Bạn chưa theo dõi người dùng này.');
    }

    this.userClient.emit('user-unfollow', { followerId: followerId });

    return { message: 'Hủy theo dõi thành công.' };
  }

  async checkStatusFollow(followerId: string, followingId: string) {
    const check = await this.followModel.exists({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    return {
      isFollowed: Boolean(check),
    };
  }

  async getIdsFollowing(followerId: string) {
    const result = await this.followModel
      .distinct('followingId', { followerId: new Types.ObjectId(followerId) })
      .exec();
    console.log(result);
  }
}
