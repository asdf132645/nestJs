import { Module, CacheModule, forwardRef } from "@nestjs/common";
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInformation } from './company.entity';
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { ReviewsModule } from "../review/reviews.module";
import { Review } from "../review/Review.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyInformation, Review]),
    CacheModule.register({ ttl: 600, max: 1000 }),
    forwardRef(() => ReviewsModule),
    UserModule,
    AuthModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
