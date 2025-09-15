import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationService } from '../conversation/conversation.service';
import * as jwt from 'jsonwebtoken';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  @Get(':receiverId')
  async getMessageToConversation(@Param('receiverId') receiverId, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const currentUserId = decoded?.sub;

    return this.messageService.getMessageToConversation(
      currentUserId,
      receiverId,
    );
  }

  @Post('read')
  async markMessagesAsRead(@Body('receiverId') receiverId: string, @Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const currentUserId = decoded?.sub;

    return this.messageService.markMessagesAsRead(currentUserId, receiverId);
  }
}
