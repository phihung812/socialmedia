import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadfileService } from '../uploadfile/uploadfile.service';
import { Types } from 'mongoose';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadfileService: UploadfileService,
  ) {}

  @MessagePattern({ cmd: 'get-user-by-id' })
  async getUser(email: string) {
    return this.userService.findUser(email);
  }

  @Get()
  async findAll() {
    return await this.userService.getAll();
  }

  @Get('profile')
  async findOne(@Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    return await this.userService.findById(userId);
  }

  @Get('/:username')
  async findByUsername(@Param('username') username: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const followingId = decoded?.sub;
    if (!username) {
      throw new Error('Username không tồn tại');
    }
    return await this.userService.findByUsername(username, followingId);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }

    return this.userService.updateUser(userId, updateUserDto);
  }

  @MessagePattern({ cmd: 'update-count-post' })
  async updateCountPost(userId: string) {
    await this.userService.updateCountPost(userId, 1);
  }

  @MessagePattern({ cmd: 'update-count-post-delete' })
  async updateCountPostToDelete(userId: string) {
    await this.userService.updateCountPost(userId, -1);
  }

  @Put('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    const user = await this.userService.findById(userId);
    const oldPublicId = user.avatar.avatar_public_id;

    const result = await this.uploadfileService.uploadImage({
      file,
      oldPublicId,
    });

    await this.userService.updateAvatar(userId, {
      avatar: {
        avatar_url: result.secure_url,
        avatar_public_id: result.public_id,
      },
    });

    return { avatarUrl: result.secure_url };
  }

  @EventPattern('user-follow')
  async handleFollow(@Payload() data: any) {
    const result = await this.userService.updateFollow(data);
  }

  @EventPattern('user-unfollow')
  async handleUnFollow(@Payload() data: any) {
    const result = await this.userService.updateUnFollow(data);
  }

  @MessagePattern({ cmd: 'get-infor-user-comment' })
  async handleGetUserInfo(@Payload() userIds: string[]) {
    const results = await this.userService.handleGetUserInforToComment(userIds);
    return results;
  }

  @MessagePattern({ cmd: 'user-info' })
  async getInfoUser(@Payload() data) {    
    return await this.userService.userInfoById(data);
  }

  @MessagePattern({ cmd: 'list-infor-user' })
  async listUser(@Payload() userIds: string[]) {
    return this.userService.getListInforUser(userIds);
  }

}
