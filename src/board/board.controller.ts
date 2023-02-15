import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardService } from './board.service';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardsService: BoardService) {}

  @Get()
  getAll(): Board[] {
    return this.boardsService.getAll();
  }

  @Get('search')
  search(@Query('year') searchingYear: string) {
    return `We are searching for a board made after: ${searchingYear}`;
  }

  @Get(':id')
  getOne(@Param('id') mid: number): Board {
    return this.boardsService.getOne(mid);
  }

  @Post()
  create(@Body() boardData: CreateBoardDto) {
    return this.boardsService.create(boardData);
  }

  @Delete(':id')
  remove(@Param('id') mid: number) {
    return this.boardsService.deleteOne(mid);
  }

  @Patch(':id')
  patch(@Param('id') mid: number, @Body() updateData: UpdateBoardDto) {
    return this.boardsService.update(mid, updateData);
  }
}
