import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from '../games/game.entity.js';

export enum PollStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('Polls')
export class Poll {
  @PrimaryGeneratedColumn()
  poll_id: number; //[cite: 2]

  @Column({ type: 'varchar', length: 500 })
  question: string; //[cite: 2]

  @Column({ type: 'text', nullable: true })
  description: string; //[cite: 2]

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string; //[cite: 2]

  @Column({ type: 'enum', enum: PollStatus, default: PollStatus.ACTIVE })
  status: PollStatus; //[cite: 2]

  @CreateDateColumn()
  created_at: Date; //[cite: 2]

  @Column({ type: 'datetime', nullable: true })
  ends_at: Date | null; //[cite: 2]

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game; //[cite: 2]
}
