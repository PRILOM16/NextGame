import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm'; // Добавлено ключевое слово type
import { User } from '../users/user.entity.js';

@Entity('Games')
export class Game {
  @PrimaryGeneratedColumn()
  game_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_url: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.games, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'developer_id' })
  developer: Relation<User>;
}
