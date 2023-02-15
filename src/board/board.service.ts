import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardService {
    private boards:Board[] = [];
    
    getAll():Board[] {
        return this.boards;
    }

    getOne(id:number):Board {
        const movie = this.boards.find(movie => movie.id === +id);
        if (!movie){
            throw new NotFoundException(`Movie with ID ${id} not found.`)
        }
        return movie
    }

    deleteOne(id:number) {
        this.getOne(id)
        this.boards = this.boards.filter(movie => movie.id !== +id);
    }

    create(movieData:CreateBoardDto){
        this.boards.push({
            id: this.boards.length + 1,
            ...movieData
        })
    }
    
    update(id:number, updateData:UpdateBoardDto){
        const movie = this.getOne(id);
        this.deleteOne(id);
        this.boards.push({...movie, ...updateData});
    }

    search(){}
}
