import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../user/entities/user.entity";

@Entity()
export abstract class Order {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  orderNum: string;

  @Column()
  status: string;

  @Column({name: 'userId'})
  userId:string;

  @Column()
  companyName:string;

  @Column()
  address:string;

  @Column()
  visitDate:string;


  @Column()
  visitWhether:boolean;

  @Column()
  callDate: string;

  @CreateDateColumn()
  createdAt: Date;


}
