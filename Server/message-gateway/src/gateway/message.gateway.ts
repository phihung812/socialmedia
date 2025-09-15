import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RmqContext } from '@nestjs/microservices';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  path: '/message-gateway/socket.io/',
})
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly streamName = 'message-stream';
  private readonly consumerGroup = 'chat-service-group';
  private readonly consumerName: string;
  private isConsuming = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly amqpConnection: AmqpConnection,
  ) {
    // Tạo unique consumer name cho mỗi instance
    this.consumerName = `consumer-${process.env.INSTANCE_ID || process.pid}-${Date.now()}`;
  }

  async onModuleInit() {
    await this.setupRedisStreams();
  }

  async afterInit(server: Server) {
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    const pubClient = new Redis(redisUrl);
    const subClient = new Redis(redisUrl);

    server.adapter(createAdapter(pubClient, subClient));
  }

  private async setupRedisStreams() {
    try {
      const groupExists = await this.redisService.groupExists(
        this.streamName,
        this.consumerGroup,
      );

      if (!groupExists) {
        await this.redisService.xgroup(
          'CREATE',
          this.streamName,
          this.consumerGroup,
          '$',
          'MKSTREAM',
        );
        console.log(`Đã tạo stream consumer group: ${this.consumerGroup}`);
      } else {
        console.log(`Consumer group ${this.consumerGroup} đã tồn tại`);
      }

      this.startConsuming();
    } catch (error) {
      console.error(
        'Lỗi khi kiểm tra và tạo redis stream consumer group:',
        error,
      );
    }
  }

  private async startConsuming() {
    if (this.isConsuming) return;
    this.isConsuming = true;

    while (this.isConsuming) {
      try {
        const messages = await this.redisService.xreadgroup(
          'GROUP',
          this.consumerGroup,
          this.consumerName,
          'COUNT',
          1,
          'BLOCK',
          1000,
          'STREAMS',
          this.streamName,
          '>',
        );

        if (messages && messages.length > 0) {
          for (const [stream, streamMessages] of messages) {
            for (const [messageId, fields] of streamMessages) {
              try {
                await this.processMessage(messageId, fields);

                await this.redisService.xack(
                  this.streamName,
                  this.consumerGroup,
                  messageId,
                );

                console.log(`Tin nhắn đã được xử lý và xác nhận: ${messageId}`);
              } catch (error) {
                console.error(`Lỗi khi xử lý tin nhắn ${messageId}:`, error);
              }
            }
          }
        }
      } catch (error) {
        if (error.message.includes('NOGROUP')) {
          console.log('Không tìm thấy consumer group , đang tìm lại...');
          await this.setupRedisStreams();
        } else {
          console.error('Error reading from stream:', error);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }

  private async processMessage(messageId: string, fields: string[]) {    
    const data = await this.parseStreamFields(fields);    

    const messageNew = {
      id: data.data?.id,
      content: data.data?.content,
      senderId: data.data?.senderId,
      conversationId: data.data?.conversationId,
      createdAt: data.data?.createdAt,
      sender: {
        senderUsername: data.data?.senderUsername,
        senderAvatar: data.data?.senderAvatar,
        senderFullName: data.data?.senderFullName,
      },
    };        
    this.server.to(data.data.receiverId).emit('message-see', messageNew);
    this.server.to(data.data.receiverId).emit('sidebar-message-update', messageNew);
    this.server.to(data.data.senderId).emit('message-send-completed', messageNew);
    
  }

  // xử lý feilds nhân được chuyển sang dạng object
  private parseStreamFields(fields: string[]): any {

    const result: any = {};

    for (let i = 0; i < fields.length; i += 2) {
      const key = fields[i];
      const value = fields[i + 1];

      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    }

    return result;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(token);

      const userId = payload.sub || payload.id;
      // Gắn full user info vào socket
      (client as any).user = {
        id: userId,
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        avatar: payload.avatar,
        role: payload.role,
      };

      if (userId) {
        client.join(userId);
        console.log(`User ${userId} đã kết nối`);
      }
    } catch (err) {
      console.log('Xác thực socket thất bại', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user?.id) {
      console.log(`User ${user.id} đã ngắt kết nối`);
    } else {
      console.log('Một client không xác định đã ngắt kết nối');
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    
    const user = (client as any).user;
    const message = {
      ...data,
      senderId: user.id,
      senderUsername: user.username,
      senderFullName: user.fullName,
      senderAvatar: user.avatar,
    };

    await this.amqpConnection.publish(
      'message_exchange',
      `message.create`,
      message,
    );
  }

  async onModuleDestroy() {
    this.isConsuming = false;

    try {
      await this.redisService.xgroupDelConsumer(
        this.streamName,
        this.consumerGroup,
        this.consumerName,
      );
      console.log(`Cleaned up consumer: ${this.consumerName}`);
    } catch (error) {
      console.error('Error cleaning up consumer:', error);
    }
  }

  async getStreamInfo() {
    try {
      const streamInfo = await this.redisService.xinfoStream(this.streamName);
      const groupsInfo = await this.redisService.xinfoGroups(this.streamName);
      const consumersInfo = await this.redisService.xinfoConsumers(
        this.streamName,
        this.consumerGroup,
      );

      return {
        stream: streamInfo,
        groups: groupsInfo,
        consumers: consumersInfo,
      };
    } catch (error) {
      console.error('Error getting stream info:', error);
      return null;
    }
  }
}
