import { BadRequestException, Body, Controller, Delete, Get, Inject, InternalServerErrorException, Param, Post, Query, Req, UnauthorizedException, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import * as jwt from 'jsonwebtoken';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadfileService } from '../uploadfile/uploadfile.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';


@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly uploadfileService: UploadfileService,
  ) {}
  @Get()
  getAll() {
    return this.postService.getAll();
  }

  @Get('list-post')
  getPostByUserId(@Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    return this.postService.getPostToProfileMe(userId);
  }

  @Get('posts-user-profile/:id')
  getPostByUserProfile(@Param('id') id: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;

    if (!currentUserId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    return this.postService.getPostBysUserId(id, currentUserId);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;
    if (!currentUserId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    const result = await this.postService.getPostById(postId, currentUserId);
    return result;
    
  }

  @MessagePattern({ cmd: 'info-post' })
  async getInfoPost(
    @Payload() data,
  ) {    
    return await this.postService.getInfoPost(data);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng tải lên ít nhất một hình ảnh');
    }

    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;
    const username = decoded?.username;
    const fullName = decoded?.fullName;
    const avatar = decoded?.avatar;

    if (!userId) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    try {
      const uploadResults = await this.uploadfileService.uploadImage({
        files,
      });

      const images = uploadResults.map((result) => ({
        image_url: result.secure_url,
        image_public_id: result.public_id,
      }));

      const newPost = await this.postService.createPost({
        ...createPostDto,
        userId,
        images,
        author: {
          userId,
          username,
          fullName,
          avatar,
        },
      });

      return {
        message: 'Tạo bài viết thành công',
        data: newPost,
      };
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error);
      throw new InternalServerErrorException(
        `Không thể tạo bài viết: ${error.message || 'Lỗi không xác định'}`,
      );
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;
    const username = decoded.username;
    return this.postService.deletePost(postId, currentUserId, username);
  }

  @EventPattern({ cmd: 'update-countLike-post' })
  async handleUpdateCountLikePost(data: any) {
    const { postId, count } = data;
    return this.postService.updateCountLikePost(postId, count);
  }

  @EventPattern({ cmd: 'comment.created' })
  async handleUpdateCommentCount(data: any) {
    const { postId, count } = data;
    return this.postService.updateCommentCountPost(postId, count);
  }
}
