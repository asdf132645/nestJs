import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  userName: string;

  @PrimaryColumn()
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
