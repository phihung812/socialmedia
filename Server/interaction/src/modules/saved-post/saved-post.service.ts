import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SavedPost, SavedPostDocument } from './schema/savePost.schema';
import { Model, Types } from 'mongoose';
import { CreateSavedPostDto } from './dto/create-savePost.dto';

@Injectable()
export class SavedPostService {
  constructor(
    @InjectModel(SavedPost.name)
    private savedPostModel: Model<SavedPostDocument>,
  ) {}

  // Lưu bài viết
  async savePost(
    userId: string,
    username: string,
    createDto: CreateSavedPostDto,
  ) {
    try {
      const savedPost = new this.savedPostModel({
        userId: new Types.ObjectId(userId),
        postId: new Types.ObjectId(createDto.postId),
        collectionName: createDto.collectionName || 'Default',
        images: createDto.images || [],
        statistics: createDto.statistics || { likeCount: 0, commentCount: 0 },
        author: {
          userId: userId,
          username: username,
        },
      });

      return await savedPost.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Post already saved');
      }
      throw error;
    }
  }

  async unsavePost(userId: string, postId: string) {    
    const result = await this.savedPostModel.deleteOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Không tìm thấy bài viết đã lưu');
    }

    return { message: 'Đã bỏ lưu bài viết thành công' };
  }

  // Lấy danh sách bài viết đã lưu
  async getSavedPosts(userId: string, queryDto) {
    const { page, limit, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: new Types.ObjectId(userId) };

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [savedPosts, total] = await Promise.all([
      this.savedPostModel.find(query).sort(sort).skip(skip).limit(limit).exec(),

      this.savedPostModel.countDocuments(query),
    ]);

    return {
      savedPosts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        count: savedPosts.length,
        total,
      },
    };
  }

  // Kiểm tra bài viết đã được lưu chưa
  async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const count = await this.savedPostModel.countDocuments({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });

    return count > 0;
  }

  async checkIsSaved(currentUserId: string, postId: string): Promise<boolean> {
    const saved = await this.savedPostModel.exists({
      userId: new Types.ObjectId(currentUserId),
      postId: new Types.ObjectId(postId),
    });    

    return Boolean(saved);
  }

  
}
