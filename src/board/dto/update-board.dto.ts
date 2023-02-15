import { PartialType } from '@nestjs/mapped-types';
import { fromEventPattern } from 'rxjs';
import { CreateBoardDto } from './create-board.dto';
export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
