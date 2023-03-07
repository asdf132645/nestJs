import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LikeReview } from './LikeReview.entity';
import { Review } from './Review.entity';
import { User } from '../user/entities/user.entity';
import { CompanyInformation } from '../company/company.entity';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';
import { ReviewsController } from './reviews.controle';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, LikeReview, User, CompanyInformation]),
    UserModule,
    forwardRef(() => CompanyModule),
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
