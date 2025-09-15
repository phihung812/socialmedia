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
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  path: '/notification-gateway/socket.io/',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly streamName = 'notification-stream';
  private readonly consumerGroup = 'notification-service-group';
  private readonly consumerName: string;
  private isConsuming = false;
  private isConsumingMap: Record<string, boolean> = {};

  private readonly streamConfigs = [
    {
      streamName: 'notification-stream',
      consumerGroup: 'notification-service-group',
      consumerName: `consumer-notification-${process.env.INSTANCE_ID || process.pid}-${Date.now()}`,
    },

    {
      streamName: 'comment-stream',
      consumerGroup: 'comment-service-group',
      consumerName: `consumer-comment-${process.env.INSTANCE_ID || process.pid}-${Date.now()}`,
    },
  ];

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {
    this.consumerName = `consumer-notification-${process.env.INSTANCE_ID || process.pid}-${Date.now()}`;
  }

  async onModuleInit() {
    // await this.setupRedisStreams();
    await this.setupAllRedisStreams();
  }

  async afterInit(server: Server) {
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    const pubClient = new Redis(redisUrl);
    const subClient = new Redis(redisUrl);

    server.adapter(createAdapter(pubClient, subClient));
  }

  private async setupAllRedisStreams() {
    for (const config of this.streamConfigs) {
      await this.setupRedisStream(config);
    }
  }

  private async setupRedisStream(config: {
    streamName: string;
    consumerGroup: string;
    consumerName: string;
  }) {
    try {
      const groupExists = await this.redisService.groupExists(
        config.streamName,
        config.consumerGroup,
      );

      if (!groupExists) {
        await this.redisService.xgroup(
          'CREATE',
          config.streamName,
          config.consumerGroup,
          '$',
          'MKSTREAM',
        );
        console.log(
          `Đã tạo stream consumer group: ${config.consumerGroup} cho stream: ${config.streamName}`,
        );
      } else {
        console.log(
          `Consumer group ${config.consumerGroup} đã tồn tại cho stream: ${config.streamName}`,
        );
      }

      // Bắt đầu consume cho từng stream
      this.startConsumingStream(config);
    } catch (error) {
      console.error(`Lỗi khi setup redis stream ${config.streamName}:`, error);
    }
  }

  private async startConsumingStream(config: {
    streamName: string;
    consumerGroup: string;
    consumerName: string;
  }) {
    const streamKey = config.streamName;

    if (this.isConsumingMap[streamKey]) return; // tránh khởi động lại
    this.isConsumingMap[streamKey] = true;

    while (this.isConsumingMap[streamKey]) {
      try {
        const messages = await this.redisService.xreadgroup(
          'GROUP',
          config.consumerGroup,
          config.consumerName,
          'COUNT',
          10,
          'BLOCK',
          1000,
          'STREAMS',
          config.streamName,
          '>',
        );

        if (messages && messages.length > 0) {
          await this.processMessages(config.streamName, messages);
        }
      } catch (error) {
        console.error(`Lỗi khi consume stream ${config.streamName}:`, error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessages(streamName: string, messages: any[]) {
    for (const [stream, streamMessages] of messages) {
      for (const [messageId, fields] of streamMessages) {
        try {
          // Xử lý message dựa trên stream type
          switch (streamName) {
            case 'notification-stream':
              await this.handleNotificationMessage(messageId, fields);
              break;
            case 'comment-stream':
              await this.handleCommentMessage(messageId, fields);
              break;
            default:
              console.warn(`Unknown stream: ${streamName}`);
          }

          // Acknowledge message
          await this.redisService.xack(
            streamName,
            this.getConsumerGroupByStream(streamName),
            messageId,
          );
        } catch (error) {
          console.error(
            `Lỗi khi xử lý message ${messageId} từ stream ${streamName}:`,
            error,
          );
        }
      }
    }
  }

  private getConsumerGroupByStream(streamName: string): string {
    const config = this.streamConfigs.find((c) => c.streamName === streamName);
    return config?.consumerGroup || '';
  }

  private async handleNotificationMessage(messageId: string, fields: any[]) {
    const data = this.parseStreamFields(fields);
    this.server
      .to(data.notification.receiverId)
      .emit('notification-new', data.notification);
  }

  private async handleCommentMessage(messageId: string, fields: any[]) {
    const data = this.parseStreamFields(fields);
    console.log(data);
    
    if (!data.comment.parentId){      
      this.server
        .to(`post-${data.comment.postId}`)
        .emit('comment-added', data.comment);
        console.log('đã emit');
        
    }else{
      this.server
        .to(`post-${data.comment.postId}`)
        .emit('reply-comment-added', data.comment);

        console.log('đã emit');
    }
  
  }

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

  @SubscribeMessage('join-post')
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;

    await client.join(`post-${data.postId}`);
    console.log(`người dùng ${user.id} đã join phòng ${data.postId}`);
  }

  @SubscribeMessage('leave-post')
  async handleLeavePost(
    @MessageBody() data: { postId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;

    await client.leave(`post-${data.postId}`);
    console.log(`Người dùng ${user.id} đã out phòng ${data.postId}`);
  }
}
