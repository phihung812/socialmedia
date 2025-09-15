import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { Post, User } from './interface/interface-notification';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly redisService: RedisService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    let notification: any = null;
    let userId: string | null = null;
    let postId: string | null = null;
    let user: User | null = null;
    let post: Post | null = null;
    // console.log(createNotificationDto);
    

    switch (createNotificationDto.type) {
      case 'like':
        if (createNotificationDto.entityType === 'post') {
          postId = createNotificationDto.referenceId;
          userId = createNotificationDto.senderId;

          const cachKeyPost = `post:${postId}`;
          const cachedPost = await this.redisService.get(cachKeyPost);
          if (cachedPost) {
            post = JSON.parse(cachedPost);
          } else {
            post = await firstValueFrom(
              this.postClient.send({ cmd: 'info-post' }, postId),
            );
            await this.redisService.set(cachKeyPost, JSON.stringify(post), 150);
          }

          if (post?.author.userId.toString() === userId) return;

          const cachKeyUser = `user:${userId}`;
          const cachedUser = await this.redisService.get(cachKeyUser);
          if (cachedUser) {
            user = JSON.parse(cachedUser);
          } else {
            user = await firstValueFrom(
              this.userClient.send({ cmd: 'user-info' }, userId),
            );
            await this.redisService.set(
              cachKeyUser,
              JSON.stringify(user),
              1800,
            );
          }

          if (!post || !user) {
            throw new Error('Không tìm thấy bài viết hoặc người dùng');
          }

          notification = {
            receiverId: post.userId,
            senderName: user.fullName,
            image: post.images[0].image_url,
            senderId: createNotificationDto.senderId,
            type: createNotificationDto.type,
            entityType: createNotificationDto.entityType,
            referenceId: postId,
            content: `${user.fullName} đã thích bài viết của bạn`,
            url: `/${post.author.username}/${postId}`,
          };
        } else if (createNotificationDto.entityType === 'comment') {
          // Xử lý thông báo like comment
        }
        break;

      case 'comment':
        postId = createNotificationDto.referenceId;
        userId = createNotificationDto.senderId;

        const cachKey = `post:${postId}`;
        const cached = await this.redisService.get(cachKey);
        if (cached) {
          post = JSON.parse(cached);
        } else {
          post = await firstValueFrom(
            this.postClient.send({ cmd: 'info-post' }, postId),
          );
          await this.redisService.set(cachKey, JSON.stringify(post), 150);
        }

        if (post?.author.userId.toString() === userId) return;

        const cachKeyUser = `user:${userId}`;
        const cachedUser = await this.redisService.get(cachKeyUser);
        if (cachedUser) {
          user = JSON.parse(cachedUser);
        } else {
          user = await firstValueFrom(
            this.userClient.send({ cmd: 'user-info' }, userId),
          );
          await this.redisService.set(cachKeyUser, JSON.stringify(user), 1800);
        }        

        if (!post || !user) {
          throw new Error('Post or user not found when creating notification');
        }
        notification = {
          receiverId: post.userId,
          senderName: user.fullName,
          senderId: createNotificationDto.senderId,
          image: post.images[0].image_url,
          type: createNotificationDto.type,
          entityType: createNotificationDto.entityType,
          referenceId: postId,
          content: `${user.fullName} đã bình luận bài viết của bạn`,
          url: `/${post.author.username}/${postId}`,
        };

        break;

      case 'reply':
        // Xử lý reply comment

        break;
      case 'follow':
        const followingId = createNotificationDto.senderId;

        const cachKeyUserF = `user:${followingId}`;
        const cachedUserF = await this.redisService.get(cachKeyUserF);
        if (cachedUserF) {
          user = JSON.parse(cachedUserF);
        } else {
          user = await firstValueFrom(
            this.userClient.send({ cmd: 'user-info' },  followingId ),
          );
          await this.redisService.set(cachKeyUserF, JSON.stringify(user), 1800);
        }
        if (!user) {
          throw new Error('Post or user not found when creating notification');
        }

        notification = {
          receiverId: createNotificationDto.receiverId,
          senderName: user.fullName,
          senderId: createNotificationDto.senderId,
          image: user.avatar.avatar_url,
          type: createNotificationDto.type,
          entityType: createNotificationDto.entityType,
          referenceId: followingId,
          content: `${user.fullName} đã bắt đầu theo dõi bạn`,
          url: `/${user.username}`,
        };
        break;

      default:
      // xử lý mặc định hoặc lỗi
    }

    if (!notification) {
      throw new Error('Không thể tạo thông báo từ dữ liệu đã cho');
    }

    const creataeNotification = new this.notificationModel(notification);
    const result = await creataeNotification.save();

    await this.publishMessageCompletedAsJson(result);

    await this.invalidateNotificationCache(createNotificationDto.receiverId!);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find()
        .populate('receiverId', 'username email')
        .populate('senderId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments().exec(),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // lấy tất cả thông báo theo người nhận
  async findByReceiverId(
    receiverId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const listCacheKey = `notifications:${receiverId}:page:${page}`;
    const totalCacheKey = `notifications:${receiverId}:total`;

    // Lấy cache danh sách thông báo
    const cachedList = await this.redisService.get(listCacheKey);
    const cachedTotal = await this.redisService.get(totalCacheKey);

    let notifications: Notification[];
    let total: number;

    if (cachedList) {
      notifications = JSON.parse(cachedList);
    } else {
      notifications = await this.notificationModel
        .find({ receiverId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // Lưu cache danh sách
      await this.redisService.set(
        listCacheKey,
        JSON.stringify(notifications),
        60,
      );
    }

    if (cachedTotal) {
      total = parseInt(cachedTotal, 10);
    } else {
      total = await this.notificationModel
        .countDocuments({ receiverId })
        .exec();
      await this.redisService.set(totalCacheKey, total.toString(), 15);
    }

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // lấy theo id
  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('receiverId', 'username email')
      .populate('senderId', 'username email')
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  // cập nhật thông báo (đã đọc,...)
  async update(id: string, updateNotificationDto): Promise<Notification> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();

    if (!updatedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updatedNotification;
  }

  // đánh dấu đã đọc
  async markAsRead(id: string, currentUserId: string) {
    await this.invalidateNotificationCache(currentUserId);

    await this.update(id, { isRead: true });
  }

  // đánh dấu tất cả đã đọc
  async markAllAsReadByReceiverId(
    receiverId: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel
      .updateMany(
        { receiverId: new Types.ObjectId(receiverId), isRead: false },
        { isRead: true },
      )
      .exec();

    return { modifiedCount: result.modifiedCount };
  }

  // xóa thông báo
  async remove(id: string, currentUserId: string): Promise<Notification> {
    const deletedNotification = await this.notificationModel
      .findByIdAndDelete(id)
      .exec();

    await this.invalidateNotificationCache(currentUserId);

    if (!deletedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return deletedNotification;
  }

  async invalidateNotificationCache(receiverId: string, maxPages = 3) {
    const keysToDelete: string[] = [];

    for (let p = 1; p <= maxPages; p++) {
      keysToDelete.push(`notifications:${receiverId}:page:${p}`);
    }

    keysToDelete.push(`notifications:${receiverId}:total`);

    await this.redisService.del(...keysToDelete);
  }

  // đếm số thông báo chưa đọc
  async getUnreadCount(receiverId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({
        receiverId: new Types.ObjectId(receiverId),
        isRead: false,
      })
      .exec();
  }

  // xoa tất cả thong bao theo nguoi nhan
  async removeByReferenceId(
    referenceId: string,
  ): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel
      .deleteMany({ referenceId: new Types.ObjectId(referenceId) })
      .exec();

    return { deletedCount: result.deletedCount };
  }

  private async publishMessageCompletedAsJson(notificationData: any) {
    try {
      const streamName = 'notification-stream';

      const messageId = await this.redisService.xadd(
        streamName,
        '*',
        'notification',
        JSON.stringify(notificationData),
      );

      console.log(`Đã thêm thông báo vào Redis Stream: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('Có lỗi khi thêm thông báo vào Redis Stream:', error);
      throw error;
    }
  }
}
