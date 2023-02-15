import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  readonly title: string;

  @IsNumber()
  readonly year: number;

  @IsOptional()
  @IsString({ each: true })
  readonly genres: string[];
}
