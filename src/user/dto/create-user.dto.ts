import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  userName: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  businessNumber: string;

  @IsString()
  service: string;
}

export class CheckSmsDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  inputNumber: string;
}
