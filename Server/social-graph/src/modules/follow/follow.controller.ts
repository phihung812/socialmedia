import { Get, Post, Body, Req } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Controller } from '@nestjs/common';
import { FollowService } from './follow.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';


@Controller('graph')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow')
  createFollow(@Req() req, @Body('followingId') followerId: string) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const followingId = decoded?.sub;
    return this.followService.createFollow(followingId, followerId);
  }

  @Post('unfollow')
  unFollow(@Req() req, @Body('followerId') followerId: string) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const followingId = decoded?.sub;
    return this.followService.unFollow(followerId, followingId);
  }

  @MessagePattern({ cmd: 'check-follow-status' })
  async checkkStatusFollow(
    @Payload() data: { followerId: string; followingId: string },
  ) {
    
    const { followerId, followingId } = data;
    const result = await this.followService.checkStatusFollow(
      followerId,
      followingId,
    );

    return result;
  }

  @EventPattern('create-post')
  async getListFollowMyAuthor(@Payload() data: string){    
    await this.followService.getIdsFollowing(data);
  }
}
