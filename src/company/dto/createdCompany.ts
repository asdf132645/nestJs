import { IsBoolean, IsString } from "class-validator";
import { OneToMany } from "typeorm";
import { Review } from "../../review/Review.entity";

export class createdCompanyDto {

  @IsString()
  createdAt: Date;


  @OneToMany(() => Review, (review) => review.company, { cascade: true })
  reviews: Review[];
}
