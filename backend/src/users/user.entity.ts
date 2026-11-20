import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm'; // Добавлено ключевое слово type
import { Game } from '../games/game.entity.js';

export enum UserRole {
  USER = 'USER',
  DEVELOPER = 'DEVELOPER',
  SUPERUSER = 'SUPERUSER',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Game, (game) => game.developer)
  games: Relation<Game>[];
}
