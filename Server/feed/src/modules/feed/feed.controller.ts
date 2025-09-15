import { Controller } from '@nestjs/common';
import { FeedService } from './feed.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @EventPattern('user-create')
  async createFeed(@Payload() data: string) {    
    await this.feedService.create(data);
  }
}
