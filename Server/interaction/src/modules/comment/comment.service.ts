import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { UserInfo } from '../common/interface/userCache.interface';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    private readonly redisClient: RedisService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    user: any,
  ): Promise<CommentDocument> {
    const { postId, parentId, mentionedUsers } = createCommentDto;
    const { username, fullName, avatar } = user;
    const userId = user.sub;

    // Nếu có parentId, kiểm tra comment cha có tồn tại và cùng post
    if (parentId) {
      const parentComment = await this.commentModel.findById(parentId);
      if (!parentComment) {
        throw new BadRequestException('Không tìm thấy bình luận cha.');
      }

      if (parentComment.postId.toString() !== postId) {
        throw new BadRequestException(
          'Bình luận cha phải thuộc cùng một bài viết.',
        );
      }
    }

    const newComment = new this.commentModel({
      ...createCommentDto,
      userId: new Types.ObjectId(userId as string),
      postId: new Types.ObjectId(postId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      mentionedUsers: mentionedUsers?.map((id) => new Types.ObjectId(id)) || [],
    });

    if (parentId) {
      await this.commentModel.updateOne(
        { _id: parentId },
        { $inc: { replyCount: 1 } },
      );
    }
    const savedComment = await newComment.save();

    const count = 1;
    this.postClient.emit({ cmd: 'comment.created' }, { postId, count });

    const commentRaw = await this.commentModel
      .findById(savedComment._id)
      .lean();

    if (!commentRaw) {
      throw new InternalServerErrorException('Lỗi khi tạo bình luận.');
    }

    const data = {
      senderId: userId,
      type: 'comment',
      entityType: 'post',
      referenceId: postId,
    };
    this.notificationClient.emit({ cmd: 'create-notification' }, data);

    const author = {
      _id: userId,
      username: username,
      fullName: fullName,
      avatar: {
        avatar_url: avatar,
      },
    };

    const result = {
      ...commentRaw,
      author,
    };

    await this.publishMessageCompletedAsJson(result);
    return result;
  }

  private async publishMessageCompletedAsJson(messageData: any) {
    try {
      const streamName = 'comment-stream';

      const messageId = await this.redisClient.xadd(
        streamName,
        '*',
        'comment',
        JSON.stringify(messageData),
      );

      console.log(`Đã thêm comment Redis Stream: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('Có lỗi khi thêm comment Redis Stream:', error);
      throw error;
    }
  }

  async getCommentsByPost(
    postId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'popular' = 'newest',
  ) {
    page = page < 1 ? 1 : page;
    const skip = (page - 1) * limit;
    const postObjectId = new Types.ObjectId(postId);

    let sortOptions: any = { createdAt: -1 }; // newest first
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (sortBy === 'popular') sortOptions = { likeCount: -1, createdAt: -1 };

    const comments = await this.commentModel
      .find({ postId: postObjectId, parentId: null })
      .select(
        'content userId username fullName createdAt likeCount postId replyCount avatar',
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const userIds: string[] = comments.map((c) => c.userId.toString());

    // Lấy thông tin user với cache
    const users = await this.getUsersWithCache(userIds);

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const commentsWithUser = comments.map((comment) => {
      const author = userMap.get(comment.userId?.toString());
      return {
        ...comment.toObject(),
        author,
      };
    });

    const total = await this.commentModel.countDocuments({
      postId: postObjectId,
      parentId: null,
    });

    return {
      comments: commentsWithUser,
      total,
      hasMore: page * limit < total,
    };
  }

  async getUsersWithCache(userIds: string[]) {
    const cachedUsers = new Map();
    const uncachedUserIds: string[] = [];

    for (const userId of userIds) {
      const cacheKey = `user:${userId}`;

      try {
        const cachedUser = await this.redisClient.get(cacheKey);

        if (cachedUser) {
          cachedUsers.set(userId, JSON.parse(cachedUser));
        } else {
          uncachedUserIds.push(userId);
        }
      } catch (error) {
        uncachedUserIds.push(userId);
      }
    }

    let fetchedUsers: UserInfo[] = [];

    if (uncachedUserIds.length > 0) {
      fetchedUsers = await firstValueFrom(
        this.userClient.send({ cmd: 'list-infor-user' }, uncachedUserIds),
      );

      const cachePromises = fetchedUsers.map(async (user) => {
        const cacheKey = `user:${user._id.toString()}`;
        try {
          await this.redisClient.set(cacheKey, JSON.stringify(user), 1800);
        } catch (error) {
          console.error(`Lỗi khi lưu cache user ${user._id}:`, error);
        }
      });

      // Không chờ cache save để không block response
      Promise.all(cachePromises).catch(console.error);
    }

    const allUsers = [...Array.from(cachedUsers.values()), ...fetchedUsers];

    return allUsers;
  }

  async getReplies(commentId: string, page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    const replies = await this.commentModel
      .find({ parentId: new Types.ObjectId(commentId) })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const userIds: string[] = replies.map((r) => r.userId.toString());

    const users = await this.getUsersWithCache(userIds);

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const repliesWithUser = replies.map((comment) => {
      const author = userMap.get(comment.userId?.toString());
      return {
        ...comment.toObject(),
        author,
      };
    });

    const total = await this.commentModel.countDocuments({
      parentId: new Types.ObjectId(commentId),
    });

    return {
      replies: repliesWithUser,
      total,
      hasMore: skip + replies.length < total,
    };
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Chỉ cho phép user tạo comment mới được sửa
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Chỉ cho phép sửa content và mentionedUsers
    const updatedComment = await this.commentModel
      .findByIdAndUpdate(
        commentId,
        {
          content: updateCommentDto.content || comment.content,
          mentionedUsers:
            updateCommentDto.mentionedUsers?.map(
              (id) => new Types.ObjectId(id),
            ) || comment.mentionedUsers,
        },
        { new: true },
      )
      .populate('userId', 'username fullName avatar')
      .populate('mentionedUsers', 'username fullName')
      .exec();

    if (!updatedComment) {
      throw new InternalServerErrorException('Lỗi khi cập nhật comment');
    }
    return updatedComment;
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Chỉ cho phép user tạo comment mới được xóa
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.parentId) {
      await this.commentModel.findByIdAndUpdate(comment.parentId, {
        $inc: { replyCount: -1 },
      });
    }

    // Xóa comment và tất cả replies
    await this.commentModel.deleteMany({
      $or: [
        { _id: new Types.ObjectId(commentId) },
        { parentId: new Types.ObjectId(commentId) },
      ],
    });
  }

  // Like/Unlike comment
  async toggleLike(
    commentId: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Kiểm tra user đã like chưa (cần có bảng CommentLike riêng hoặc array trong Comment)
    // Ở đây giả sử có service khác xử lý like/unlike
    // Chỉ cập nhật likeCount

    // Logic toggle like sẽ được implement trong LikeService
    // Đây chỉ là method để cập nhật count
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      commentId,
      { $inc: { likeCount: 1 } }, // hoặc -1 nếu unlike
      { new: true },
    );

    if (!updatedComment) {
      throw new InternalServerErrorException('Lỗi khi like/unlike comment');
    }
    return {
      liked: true, // từ LikeService
      likeCount: updatedComment.likeCount,
    };
  }

  // Lấy comments của user
  async getUserComments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: CommentDocument[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('postId', 'content images')
      .populate('userId', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    return {
      comments,
      total,
      hasMore: skip + comments.length < total,
    };
  }

  // Tìm kiếm comments
  async searchComments(
    query: string,
    postId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: CommentDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchFilter: any = {
      $text: { $search: query },
    };

    if (postId) {
      searchFilter.postId = new Types.ObjectId(postId);
    }

    const comments = await this.commentModel
      .find(searchFilter)
      .populate('userId', 'username fullName avatar')
      .populate('postId', 'content')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments(searchFilter);

    return { comments, total };
  }

  // Lấy comments có mention user
  async getMentionedComments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: CommentDocument[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ mentionedUsers: new Types.ObjectId(userId) })
      .populate('userId', 'username fullName avatar')
      .populate('postId', 'content images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments({
      mentionedUsers: new Types.ObjectId(userId),
    });

    return {
      comments,
      total,
      hasMore: skip + comments.length < total,
    };
  }
}
