import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ServiceEntities } from '../../service/entities/service.entities';

@Entity()
export abstract class User {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  userName: string;

  @Column()
  userId: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  accountNumber: string;

  @Column()
  accountName: string;

  @Column()
  businessNumber: string;

  @Column()
  service: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

}


