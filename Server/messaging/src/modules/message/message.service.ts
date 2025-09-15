import {
  Inject,
  Injectable,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CreateMessageDto } from './dto/create-message.dto';
import { RedisService } from '../redis/redis.service';
import { ConversationService } from '../conversation/conversation.service';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisService: RedisService,
    private readonly conversationService: ConversationService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      const newMessage = new this.messageModel({
        conversationId: new Types.ObjectId(createMessageDto.conversationId),
        senderId: new Types.ObjectId(createMessageDto.senderId),
        sender: {
          senderUsername: createMessageDto.senderUsername,
          senderFullName: createMessageDto.senderFullName,
          senderAvatar: createMessageDto.senderAvatar,
        },
        content: createMessageDto.content,
        contentType: createMessageDto.contentType || 'text',
        mediaUrl: createMessageDto.mediaUrl,
        readBy: [new Types.ObjectId(createMessageDto.senderId)],
        isDeleted: false,
      });

      const savedMessage = await newMessage.save();

      const populatedMessage = await this.messageModel
        .findById(savedMessage._id)
        .exec();

      if (!populatedMessage) {
        throw new Error('Không tìm thấy tin nhắn sau khi lưu.');
      }

      return populatedMessage.toObject();
    } catch (error) {
      throw new Error(`Lỗi khi tạo tin nhắn: ${error.message}`);
    }
  }

  async getMessageToConversation(
    userIdA: string,
    userIdB: string,
    lastMessageCreatedAt?: Date,
  ) {
    const conversation = await this.conversationService.findConversation(
      userIdA,
      userIdB,
    );

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    const deletedAt = conversation.deletedAtFor?.get(userIdA);

    const filter: any = {
      conversationId: conversation._id,
      isDeleted: false,
    };

    // goi api lần 2 thì truyền vào thời gian của tin nhắn thứ 20 để lấy ra 20 tin nhắn tiếp theo
    if (deletedAt || lastMessageCreatedAt) {
      filter.createdAt = {};
      if (deletedAt) {
        filter.createdAt.$gt = deletedAt; // Chỉ lấy tin nhắn sau khi xóa
      }
      if (lastMessageCreatedAt) {
        filter.createdAt.$lt = lastMessageCreatedAt;
      }
    }

    const messages = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return messages;
  }

  @RabbitSubscribe({
    exchange: 'message_exchange',
    routingKey: 'message.create',
    queue: 'message_created_queue',
  })
  async handleSendMessage(msg: any) {    
    
    const {
      senderId,
      receiverId,
      content,
      senderAvatar,
      senderFullName,
      senderUsername,
    } = msg;

    let conversation = await this.conversationService.isExist(
      senderId,
      receiverId,
    );

    if (!conversation) {
      const receiver = await firstValueFrom(
        this.userClient.send({ cmd: 'user-info' }, receiverId),
      );

      conversation = await this.conversationService.createConversation({
        isGroup: false,
        participantIds: [senderId, receiverId],
        creatorId: senderId,
        participantDetails: [
          {
            userId: receiver._id,
            username: receiver.username,
            fullName: receiver.fullName,
            avatar: receiver.avatar.avatar_url,
          },
          {
            userId: senderId,
            username: senderUsername,
            fullName: senderFullName,
            avatar: senderAvatar,
          },
        ],
      });
    } else {
      const participantDetail = conversation.participantDetails.find((conv) => conv.userId === senderId);
      if (
        participantDetail?.avatar !== senderAvatar ||
        participantDetail?.username !== senderUsername ||
        participantDetail?.fullName !== senderFullName
      ) {
        const updates = {
          fullName: senderFullName,
          username: senderUsername,
          avatar: senderAvatar,
        };
        await this.conversationService.updateParticipantDetailByUserId(
          conversation._id as string,
          senderId,
          updates,
        );
      }
        
    }

    const message = {
      conversationId: conversation._id as string,
      senderId,
      senderAvatar,
      senderFullName,
      senderUsername,
      content,
    };

    const messageResult = await this.createMessage(message);

    const lastMessageId = messageResult._id;

    await this.conversationService.updateLastMessage(
      messageResult.conversationId.toString(),
      lastMessageId,
    );

    const savedMessage = {
      id: messageResult?._id,
      content: messageResult?.content,
      senderId: messageResult?.senderId,
      conversationId: messageResult.conversationId,
      createdAt: messageResult.createdAt,
      senderUsername: messageResult.sender.senderUsername,
      senderAvatar: messageResult.sender.senderAvatar,
      senderFullName: messageResult.sender.senderFullName,
      receiverId: receiverId,
    };

    await this.publishMessageCompletedAsJson(savedMessage);
  }

  async markMessagesAsRead(currentUserId: string, receiverId: string) {
    const conversation = await this.conversationService.isExist(
      currentUserId,
      receiverId,
    );

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    const userObjectId = new Types.ObjectId(currentUserId);
    const conversationObjectId = conversation._id;

    const result = await this.messageModel.updateMany(
      {
        conversationId: conversationObjectId,
        readBy: { $ne: userObjectId },
      },
      {
        $push: { readBy: userObjectId },
      },
    );
  }

  private async publishMessageCompletedAsJson(messageData: any) {
    try {
      const streamName = 'message-stream';

      const messageId = await this.redisService.xadd(
        streamName,
        '*',
        'data',
        JSON.stringify(messageData),
      );

      console.log(`Đã thêm tin nhắn Redis Stream: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('Có lỗi khi thêm tin nhắn vào Redis Stream:', error);
      throw error;
    }
  }
}
