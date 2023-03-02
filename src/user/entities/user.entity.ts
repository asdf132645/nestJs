import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from "../../order/order.entity";

@Entity()
export abstract class User {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  userName: string;

  @Column({name: 'userId'})
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

  @OneToMany(() => Order, order => order.user)
  orders: Order['userId'];
}


