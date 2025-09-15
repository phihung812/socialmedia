import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schema/conversation.schema';
import { Model, Types } from 'mongoose';
import { CreateConversationDto } from './dto/create-group-conversation.dto';
import { UpdateLastMessageDto } from './dto/update-last-message.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async createConversation(createConversation: CreateConversationDto) {
    const participants = createConversation.participantIds.map(
      (id) => new Types.ObjectId(id),
    );
    const creatorId = new Types.ObjectId(createConversation.creatorId);

    const conversation = new this.conversationModel({
      ...createConversation,
      participants,
      creatorId,
    });
    return await conversation.save();
  }

  async updateParticipantDetailByUserId(
    conversationId: string,
    userId: string,
    updates: Partial<{ fullName: string; avatar: string; username: string }>,
  ) {
    const updateFields: any = {};
    if (updates.fullName) {
      updateFields['participantDetails.$[elem].fullName'] = updates.fullName;
    }
    if (updates.avatar) {
      updateFields['participantDetails.$[elem].avatar'] = updates.avatar;
    }
    if (updates.username) {
      updateFields['participantDetails.$[elem].username'] = updates.username;
    }

    const conversationObjectId = new Types.ObjectId(conversationId);

    const result = await this.conversationModel.updateOne(
      {
        _id: conversationObjectId,
        'participantDetails.userId': userId,
      },
      {
        $set: updateFields,
      },
      {
        arrayFilters: [{ 'elem.userId': userId }],
      },
    );
    return result;
  }

  async updateLastMessage(conversationId: string, lastMessageId) {
    const updated = await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessageId: lastMessageId,
      },
      { new: true },
    );
  }

  async updateUsername(data) {
    const { newUsername, oldUsername } = data;
    const updated = await this.conversationModel.updateMany(
      { 'participantDetails.username': oldUsername }, // tìm conversation có username = oldusername
      {
        $set: {
          'participantDetails.$[elem].username': newUsername, // update newusername vào elem.username
        },
      },
      {
        arrayFilters: [{ 'elem.username': oldUsername }], // elem = phần tử nào có username = oldusername
      },
    );    

  }

  async isExist(sendId: string, receiverId: string) {
    const res = await this.conversationModel.findOne({
      participants: {
        $all: [new Types.ObjectId(sendId), new Types.ObjectId(receiverId)],
      },
    });
    return res;
  }

  async findConversation(userIdA: string, userIdB: string) {
    const conversation = await this.conversationModel.findOne({
      isGroup: false,
      participants: { $all: [userIdA, userIdB], $size: 2 },
    });
    return conversation;
  }

  async getConversationToUser(
    currentUserId: string,
    page = 1,
    limit = 20,
  ): Promise<any[]> {
    const skip = (page - 1) * limit;

    // Lấy tất cả cuộc trò chuyện mà người dùng tham gia
    const allConversations: any[] = await this.conversationModel
      .find({ participants: currentUserId })
      .populate('lastMessageId')
      .lean();

    const validConversations: any[] = [];

    for (const conv of allConversations) {
      const deletedAt: Date | undefined = conv.deletedAtFor?.[currentUserId];
      const lastMessage: any = conv.lastMessageId;

      // Nếu chưa từng xóa hoặc có tin nhắn mới hơn thời điểm xóa
      if (!deletedAt || (lastMessage && lastMessage.createdAt > deletedAt)) {
        validConversations.push({
          ...conv,
          lastMessageCreatedAt: lastMessage?.createdAt || new Date(0), // fallback nếu chưa có tin nhắn
        });
      }
    }

    // Sắp xếp theo thời gian tin nhắn gần nhất (mới nhất lên trước)
    validConversations.sort(
      (a, b) =>
        new Date(b.lastMessageCreatedAt).getTime() -
        new Date(a.lastMessageCreatedAt).getTime(),
    );

    // Áp dụng pagination
    const paginated = validConversations.slice(skip, skip + limit);

    // Format kết quả trả về
    return paginated.map((conv: any) => {
      const lastMessage = conv.lastMessageId;

      let displayAvatar: string | null = null;
      let displayName: string | undefined = conv.name;
      let displayUsername: string | undefined;
      let displayUserId: string | undefined;

      if (conv.isGroup) {
        displayAvatar = conv.avatarUrl ?? null;
        displayName = conv.name ?? 'Nhóm chưa đặt tên';
      } else {
        const otherUser = conv.participantDetails?.find(
          (p: any) => p.userId.toString() !== currentUserId,
        );

        if (otherUser) {          
          displayAvatar = otherUser.avatar ?? null;
          displayName = otherUser.fullName;
          displayUsername = otherUser.username;
          displayUserId = otherUser.userId;
        }
      }

      return {
        ...conv,
        displayAvatar,
        displayName,
        displayUsername,
        displayUserId,
        lastMessageContent: lastMessage?.content ?? null,
        lastMessageSender: lastMessage?.sender?.senderFullName ?? null,
        isRead: lastMessage?.readBy?.some(
          (id: any) => id.toString() === currentUserId,
        ),
      };
    });
  }

  async softDeleteConversation(conversationId: string, userId: string) {
    await this.conversationModel.updateOne(
      { _id: conversationId },
      { $set: { [`deletedAtFor.${userId}`]: new Date() } },
    );

    return {
      message: `Đã xóa mềm cuộc trò chuyện đối với người dùng ${userId}`,
    };
  }
}
