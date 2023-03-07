import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './Review.entity';
import { User } from '../user/entities/user.entity';

@Entity()
export class LikeReview {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Review, (review) => review.likeReview, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  review: Review;

  @ManyToOne(() => User, (user) => user.likeReview, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
