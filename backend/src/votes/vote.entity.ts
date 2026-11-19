import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Option } from '../options/option.entity.js';

@Entity('Votes')
export class Vote {
  @PrimaryGeneratedColumn()
  vote_id: number; //[cite: 2]

  @ManyToOne(() => Option, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option: Option; //[cite: 2]

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; //[cite: 2]
}
