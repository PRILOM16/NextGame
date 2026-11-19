import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from '../games/game.entity.js';

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('NEWS')
export class News {
  @PrimaryGeneratedColumn()
  news_id: number; //[cite: 2]

  @Column({ type: 'varchar', length: 255 })
  title: string; //[cite: 2]

  @Column({ type: 'text' })
  content: string; //[cite: 2]

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string; //[cite: 2]

  @Column({ type: 'enum', enum: NewsStatus, default: NewsStatus.DRAFT })
  status: NewsStatus; //[cite: 2]

  @CreateDateColumn()
  created_at: Date; //[cite: 2]

  @UpdateDateColumn({ nullable: true })
  updated_at: Date; //[cite: 2]

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game; //[cite: 2]
}
