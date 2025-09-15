import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async publish(channel: string, message: string) {
    return this.redisClient.publish(channel, message);
  }

  async subscribe(channel: string, handler: (msg: string) => void) {
    const subscriber = this.redisClient.duplicate(); // tránh conflict
    await subscriber.subscribe(channel);
    subscriber.on('message', (chan, msg) => {
      if (chan === channel) handler(msg);
    });
  }

  async xgroup(
    command: 'CREATE' | 'DESTROY' | 'SETID',
    streamName: string,
    groupName: string,
    startId?: string,
    mkstream?: 'MKSTREAM',
  ) {
    const args = ['XGROUP', command, streamName, groupName];

    if (startId) args.push(startId);
    if (mkstream) args.push(mkstream);

    return this.redisClient.sendCommand(
      new Redis.Command('XGROUP', args.slice(1)),
    );
  }

  async xreadgroup(...args: (string | number)[]): Promise<any[]> {
    return (this.redisClient.xreadgroup as any)(...args);
  }

  async xack(
    streamName: string,
    groupName: string,
    ...messageIds: string[]
  ): Promise<number> {
    return this.redisClient.xack(streamName, groupName, ...messageIds);
  }

  async xinfoStream(streamName: string): Promise<any> {
    return this.redisClient.sendCommand(
      new Redis.Command('XINFO', ['STREAM', streamName]),
    );
  }

  async xinfoConsumers(streamName: string, groupName: string): Promise<any> {
    return this.redisClient.sendCommand(
      new Redis.Command('XINFO', ['CONSUMERS', streamName, groupName]),
    );
  }

  async xgroupDelConsumer(
    streamName: string,
    groupName: string,
    consumerName: string,
  ) {
    return this.redisClient.sendCommand(
      new Redis.Command('XGROUP', [
        'DELCONSUMER',
        streamName,
        groupName,
        consumerName,
      ]),
    );
  }

  async groupExists(streamName: string, groupName: string): Promise<boolean> {
    try {
      const groups = await this.xinfoGroups(streamName);

      if (!Array.isArray(groups)) {
        return false;
      }

      return groups.some((group: any) => {
        if (Array.isArray(group) && group.length >= 2) {
          // Xử lý cả Buffer và string
          const groupNameFromRedis = group[1]?.toString?.() || group[1];
          return groupNameFromRedis === groupName;
        }
        return false;
      });
    } catch (error) {
      if (error.message?.includes('no such key')) {
        return false;
      }
      return false; // An toàn hơn
    }
  }

  async xinfoGroups(streamName: string): Promise<unknown> {
    return this.redisClient.sendCommand(
      new Redis.Command('XINFO', ['GROUPS', streamName]),
    );
  }
}
