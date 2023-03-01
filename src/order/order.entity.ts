import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export abstract class Order {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  orderNum: string;

  @Column()
  status: string;

  @Column()
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
