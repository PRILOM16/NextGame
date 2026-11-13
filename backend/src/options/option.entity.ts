import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Poll } from '../polls/poll.entity.js';

@Entity('Options')
export class Option {
  @PrimaryGeneratedColumn()
  option_id: number; //[cite: 2]

  @Column({ type: 'varchar', length: 500 })
  content: string; //[cite: 2]

  @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll; //[cite: 2]
}
