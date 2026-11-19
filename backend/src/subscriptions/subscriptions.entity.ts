import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Game } from '../games/game.entity.js';

@Entity('Subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  subscription_id: number; //

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; //

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game; //
}
