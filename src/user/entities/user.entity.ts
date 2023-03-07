import {
  BaseEntity,
  Column, CreateDateColumn, DeleteDateColumn,
  Entity, JoinColumn, ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn, Unique, UpdateDateColumn
} from "typeorm";
import { Exclude } from 'class-transformer';
import { Order } from "../../order/order.entity";
import { CompanyInformation } from '../../company/company.entity';
import {Review} from "../../review/Review.entity";
import { LikeReview } from "../../review/LikeReview.entity";

@Entity({ name: 'user' })
@Unique(['user_id'])
export abstract class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, comment: '유저 이름' })
  userName: string;

  @Column({ type: 'varchar', length: 50, comment: '유저 아이디' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, comment: '유저 비밀번호' })
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

  @CreateDateColumn({ name: 'create_at', comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
  deletedAt?: Date | null;

  @OneToMany(() => LikeReview, (like) => like.user, { cascade: true })
  likeReview: LikeReview;

  /**
   * 1 : M 관계 설정
   * @ManyToOne -> 해당 엔티티(User) To 대상 엔티티(CompanyInformation)
   *               여러 유저는 하나의 회사에 소속
   */
  @ManyToOne(
    () => CompanyInformation,
    (comapnyInformation) => comapnyInformation.userId,
  )
  @JoinColumn({ name: 'company_id' })
  companyInformation: CompanyInformation;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}


