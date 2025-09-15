import { Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  CreateGroupConversationDto,
} from './dto/create-group-conversation.dto';
import * as jwt from 'jsonwebtoken';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(createConversation: CreateConversationDto) {
    const result =
      await this.conversationService.createConversation(createConversation);
    return result;
  }

  @Get()
  async getConversation(@Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const currentUserId = decoded?.sub;

    return this.conversationService.getConversationToUser(currentUserId);
  }

  @Patch(':id/delete')
  async softDeleteConversationForUser(
    @Param('id') conversationId: string,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;

    return await this.conversationService.softDeleteConversation(
      conversationId,
      userId,
    );
  }

  @EventPattern('user-name-update')
  async updateConversation(@Payload() data) {    
    await this.conversationService.updateUsername(data)
  }
}
