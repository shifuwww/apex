import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', unique: true })
  public email: string;

  @Column({ type: 'varchar', nullable: true })
  public token: string;

  @Column({ type: 'varchar' })
  public password: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updatedAt: Date;

  @OneToMany(() => PostEntity, (posts) => posts.owner)
  public posts: PostEntity[];
}
