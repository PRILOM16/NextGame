import {
  Controller,
  Get,
  Patch,
  Post,
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
import { UsersService } from './users.service.js';
import { UserRole } from './user.entity.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { createUploadConfig } from '../common/upload.config.js';

// Настройка сохранения аватарок в папку ./uploads/avatars
const avatarUploadConfig = createUploadConfig('avatars', 'avatar');

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Получить профиль текущего пользователя
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getUserProfile(req.user.user_id);
  }

  // 2. Изменить имя (никнейм) пользователя
  @Patch('me')
  async updateProfile(@Request() req: any, @Body() body: { name: string }) {
    return this.usersService.updateProfile(req.user.user_id, body.name);
  }

  // 3. Изменить пароль пользователя
  @Patch('me/password')
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.user_id,
      body.oldPassword,
      body.newPassword,
    );
  }

  // 4. Загрузить новый аватар профиля
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.user_id, avatarUrl);
  }

  // ==========================================
  // ЭНДПОИНТЫ ДЛЯ СУПЕРЮЗЕРА (УПРАВЛЕНИЕ ПРОФИЛЯМИ)
  // ==========================================

  // 5. Получить всех пользователей
  @UseGuards(RolesGuard)
  @Roles('SUPERUSER')
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // 6. Добавить нового пользователя
  @UseGuards(RolesGuard)
  @Roles('SUPERUSER')
  @Post()
  async createUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    },
  ) {
    return this.usersService.createUserByAdmin(body);
  }

  // 7. Изменить профиль любого пользователя
  @UseGuards(RolesGuard)
  @Roles('SUPERUSER')
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      role?: UserRole;
      password?: string;
    },
  ) {
    return this.usersService.updateUserByAdmin(+id, body);
  }

  // 8. Удалить профиль пользователя
  @UseGuards(RolesGuard)
  @Roles('SUPERUSER')
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteUserByAdmin(+id, req.user.user_id);
  }
}
