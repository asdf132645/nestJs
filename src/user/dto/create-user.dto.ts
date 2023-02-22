import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsString()
  password: string;

  @IsString()
  role: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;
}

export class CheckSmsDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  inputNumber: string;
}
