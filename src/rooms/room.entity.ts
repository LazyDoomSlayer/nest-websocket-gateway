import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  device1: string | null;

  @Column()
  device2: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
