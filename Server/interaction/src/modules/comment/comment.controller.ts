import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import * as jwt from 'jsonwebtoken';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('interaction/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createdComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const result = await this.commentService.create(createCommentDto, decoded);    
    return result;
  }

  @Get(':postId')
  async getCommentsByPostId(
    @Param('postId') postId,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.commentService.getCommentsByPost(postId, pageNum, limitNum);
    return result;
    
  }

  @Get('replies/:parentId')
  async getReplyCommentsByParentId(@Param('parentId') parentId) {
    return this.commentService.getReplies(parentId);
  }

  @Delete('/:commentId')
  async deleteCommentsById(@Param('commentId') commentId, @Req() req: Request) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded.sub;
    return this.commentService.delete(commentId, userId);
  }
}
