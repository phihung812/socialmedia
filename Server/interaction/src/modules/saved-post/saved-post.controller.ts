import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CreateSavedPostDto } from './dto/create-savePost.dto';
import * as jwt from 'jsonwebtoken';
import { SavedPostService } from './saved-post.service';
import { MessagePattern } from '@nestjs/microservices';


@Controller('interaction/saved-post')
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostService) {}

  @Post()
  async savePost(@Req() req, @Body() createDto: CreateSavedPostDto) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded.sub;
    const username = decoded.username;
    return await this.savedPostsService.savePost(userId, username, createDto);
  }

  @Delete(':postId')
  async unsavePost(@Req() req, @Param('postId') postId: string) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded.sub;
    return await this.savedPostsService.unsavePost(userId, postId);
  }

  @Get()
  async getSavedPosts(@Req() req, @Query() queryDto) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded.sub;
    return await this.savedPostsService.getSavedPosts(userId, queryDto);
  }

  @MessagePattern({ cmd: 'check-isSaved' })
  async checkIsSaved(data: any) {
    const { currentUserId, postId } = data;
    
    const result = await this.savedPostsService.checkIsSaved(
      currentUserId,
      postId,
    );

    return result;
  }
}
