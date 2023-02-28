import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from "typeorm";
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ServiceEntities extends BaseEntity {
  @Column()
  proceeding: string;

  @Column()
  completed: string;

  @Column()
  status: string;

  @Column()
  requestDate: string;

  @Column()
  address: string;


}
