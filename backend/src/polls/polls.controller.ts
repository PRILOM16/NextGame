import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PollsService } from './polls.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  // Создать опрос (только DEVELOPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('games/:gameId/polls')
  async createPoll(
    @Param('gameId') gameId: string,
    @Request() req: any,
    @Body() body: { question: string; options: string[] },
  ) {
    return this.pollsService.createPoll(
      +gameId,
      req.user.user_id,
      body.question,
      body.options,
    );
  }

  // Получить опросы игры
  @Get('games/:gameId/polls')
  async getGamePolls(@Param('gameId') gameId: string) {
    return this.pollsService.getPollsForGame(+gameId);
  }

  // Проголосовать (только USER)
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

  // Закрыть опрос (только DEVELOPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('polls/:pollId/close')
  async closePoll(@Param('pollId') pollId: string, @Request() req: any) {
    return this.pollsService.closePoll(+pollId, req.user.user_id);
  }

  // Загрузить изображение опроса (только DEVELOPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('polls/:id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/polls';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `poll-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadPollImage(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Файл не найден');

    const imageUrl = `/uploads/polls/${file.filename}`;
    return this.pollsService.updatePollImage(+id, req.user.user_id, imageUrl);
  }

  // Получить голоса текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('polls/my-votes')
  async getMyVotes(@Request() req: any) {
    return this.pollsService.getMyVotes(req.user.user_id);
  }
}
