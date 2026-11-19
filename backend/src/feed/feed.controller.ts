import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { FeedService } from './feed.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(@Request() req: any) {
    return this.feedService.getUserFeed(req.user.user_id);
  }
}
