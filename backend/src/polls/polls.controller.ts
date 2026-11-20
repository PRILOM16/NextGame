import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PollsService } from './polls.service.js';
import { PollStatus } from './poll.entity.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { createUploadConfig } from '../common/upload.config.js';

// Настройка сохранения картинок опросов в папку ./uploads/polls
const pollImageUploadConfig = createUploadConfig('polls', 'poll');

@Controller()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  // 1. Создать опрос для игры (только DEVELOPER или SUPERUSER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('games/:gameId/polls')
  async createPoll(
    @Param('gameId') gameId: string,
    @Request() req: any,
    @Body() body: { question: string; options: string[] },
  ) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.pollsService.createPoll(
      +gameId,
      req.user.user_id,
      body.question,
      body.options,
      isSuperuser,
    );
  }

  // 2. Получить все опросы игры
  @Get('games/:gameId/polls')
  async getGamePolls(@Param('gameId') gameId: string) {
    return this.pollsService.getPollsForGame(+gameId);
  }

  // 3. Проголосовать в опросе (только USER или SUPERUSER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post('polls/:pollId/vote')
  async vote(
    @Param('pollId') pollId: string,
    @Request() req: any,
    @Body() body: { optionId: number },
  ) {
    return this.pollsService.vote(req.user.user_id, +pollId, body.optionId);
  }

  // 5. Завершить опрос (только DEVELOPER или SUPERUSER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('polls/:pollId/close')
  async closePoll(@Param('pollId') pollId: string, @Request() req: any) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.pollsService.closePoll(+pollId, req.user.user_id, isSuperuser);
  }

  // 6. Загрузить изображение для опроса (только DEVELOPER или SUPERUSER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('polls/:id/image')
  @UseInterceptors(FileInterceptor('image', pollImageUploadConfig))
  async uploadPollImage(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    const imageUrl = `/uploads/polls/${file.filename}`;
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.pollsService.updatePollImage(
      +id,
      req.user.user_id,
      imageUrl,
      isSuperuser,
    );
  }

  // 7. Получить список голосов текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('polls/my-votes')
  async getMyVotes(@Request() req: any) {
    return this.pollsService.getMyVotes(req.user.user_id);
  }

  // 8. Изменить опрос (вопрос или статус)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Patch('polls/:id')
  async updatePoll(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { question?: string; status?: PollStatus },
  ) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.pollsService.updatePoll(
      +id,
      req.user.user_id,
      body,
      isSuperuser,
    );
  }

  // 9. Удалить опрос
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Delete('polls/:id')
  async deletePoll(@Param('id') id: string, @Request() req: any) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.pollsService.deletePoll(+id, req.user.user_id, isSuperuser);
  }
}
