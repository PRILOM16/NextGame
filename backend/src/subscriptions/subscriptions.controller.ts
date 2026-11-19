import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard) // Доступно только авторизованным юзерам
export class SubscriptionsController {
  constructor(private readonly subsService: SubscriptionsService) {}

  // Подписаться / Отписаться (POST /subscriptions/:gameId)
  @Post(':gameId')
  async toggle(@Param('gameId') gameId: string, @Request() req: any) {
    const userId = req.user.user_id;
    return this.subsService.toggleSubscription(userId, +gameId);
  }

  // Посмотреть свои подписки (GET /subscriptions/my)
  @Get('my')
  async getMySubs(@Request() req: any) {
    return this.subsService.getMySubscriptions(req.user.user_id);
  }
}
