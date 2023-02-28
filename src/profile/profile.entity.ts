import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export abstract class Profile {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  userName: string;
}
