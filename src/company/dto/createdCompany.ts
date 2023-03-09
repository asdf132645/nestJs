import { IsBoolean, IsString } from "class-validator";
import { OneToMany } from "typeorm";
import { Review } from "../../review/Review.entity";

export class createdCompanyDto {

  @IsString()
  company_name: string;

  @IsString()
  companyDescription: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  companyType: string;

  @IsString()
  companyDetails: string;

  @IsString()
  business_number: string;

  @IsString()
  address: string;

  @IsString()
  detail_address: string;

  @IsString()
  url: string[];

  @IsString()
  updatedAt: Date;

  @IsString()
  deletedAt: Date;

  @IsString()
  createdAt: Date;


  @OneToMany(() => Review, (review) => review.company, { cascade: true })
  reviews: Review[];

  @IsString()
  companyCode: string;
}
