import { IsBoolean, IsString } from "class-validator";

export class CreateOrderDto {
  @IsString()
  orderNum: string;

  @IsString()
  status: string;

  @IsString()
  userId: string;

  @IsString()
  companyName: string;

  @IsString()
  address: string;

  @IsString()
  visitDate: string;

  @IsBoolean()
  visitWhether: boolean;

  @IsString()
  callDate: string;

  @IsString()
  createdAt: Date;

}

export class CheckService{
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsString()
  companyID: string;

  @IsString()
  userID: string;

}
