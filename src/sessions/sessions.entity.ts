import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ nullable: true })
  connection_id: string;

  @Column({ nullable: true })
  device?: string;

  @Column({ nullable: true })
  app_type?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // @ManyToOne((_type) => User, (user) => user.tasks, { eager: false })
  // @Exclude({
  //   toPlainOnly: true,
  // })
  // user: User;
}
