import { Body, Controller, Post, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import * as jwt from 'jsonwebtoken';
import { MessagePattern } from '@nestjs/microservices';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('interaction/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  async createLike(@Body('postId') postId: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;

    if (!currentUserId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    return await this.likeService.createLikePost(postId, currentUserId);
  }

  @Post('unlike')
  async unLike(@Body('postId') postId: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;
    if (!currentUserId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    return await this.likeService.unLikePost(postId, currentUserId);
  }

  @MessagePattern({ cmd: 'list-like-post' })
  async listLikePost(data: any) {
    const { currentUserId, postIds } = data;
    const result = await this.likeService.likedPostIds(currentUserId, postIds);

    return result;
  }

  @MessagePattern({ cmd: 'check-isLiked' })
  async checkIsLiked(data: any) {
    const { currentUserId, postId } = data;
    const result = await this.likeService.checkIsLiked(currentUserId, postId);

    return result;
  }
}
