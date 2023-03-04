import { IsString } from "class-validator";

export class LoginUserDto {
  @IsString()
  userId: string;

  @IsString()
  password: string;

}

export class userIdDto {
  @IsString()
  userId: string;

  @IsString()
  currentHashedRefreshToken: string;

}
