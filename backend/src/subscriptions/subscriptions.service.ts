import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscriptions.entity.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subsRepository: Repository<Subscription>,
  ) {}

  // Универсальный метод Подписки/Отписки
  async toggleSubscription(userId: number, gameId: number) {
    const existingSub = await this.subsRepository.findOne({
      where: { user: { user_id: userId }, game: { game_id: gameId } },
    });

    // Если подписка уже есть — удаляем (отписываемся)
    if (existingSub) {
      await this.subsRepository.remove(existingSub);
      return { message: 'Вы успешно отписались от игры', isSubscribed: false };
    }

    // Если нет — создаем (подписываемся)
    const newSub = this.subsRepository.create({
      user: { user_id: userId },
      game: { game_id: gameId },
    });
    await this.subsRepository.save(newSub);
    return { message: 'Вы успешно подписались на игру', isSubscribed: true };
  }

  // Получить список игр, на которые подписан пользователь
  async getMySubscriptions(userId: number) {
    return this.subsRepository.find({
      where: { user: { user_id: userId } },
      relations: { game: true }, // Подтягиваем данные об играх
    });
  }
}
