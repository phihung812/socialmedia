import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';


@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern({ cmd: 'create-notification' })
  async create(
    @Payload() createNotificationDto: CreateNotificationDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    const notification = await this.notificationService.create(
      createNotificationDto,
    );
    channel.ack(originalMsg);

  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.notificationService.findAll(pageNum, limitNum);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications retrieved successfully',
      data: result,
    };
  }

  @Get('receiver/:receiverId')
  async findByReceiverId(
    @Param('receiverId') receiverId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);    

    const result = await this.notificationService.findByReceiverId(
      receiverId,
      pageNum,
      limitNum,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications retrieved successfully',
      data: result,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {   
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub; 
    const notification = await this.notificationService.markAsRead(id, currentUserId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification marked as read successfully',
    };
  }

  @Patch('receiver/:receiverId/read-all')
  async markAllAsRead(@Param('receiverId') receiverId: string) {
    const result =
      await this.notificationService.markAllAsReadByReceiverId(receiverId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications marked as read successfully',
      data: result,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);

    const currentUserId = decoded?.sub;
    await this.notificationService.remove(id, currentUserId);
  }

  @Delete('reference/:referenceId')
  async removeByReferenceId(@Param('referenceId') referenceId: string) {
    const result =
      await this.notificationService.removeByReferenceId(referenceId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications deleted successfully',
      data: result,
    };
  }
}
