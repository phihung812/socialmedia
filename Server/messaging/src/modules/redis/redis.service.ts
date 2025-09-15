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

  async xadd(streamName: string, id: string, ...fields: string[]) {
    return this.redisClient.xadd(streamName, id, ...fields);
  }

  
}
