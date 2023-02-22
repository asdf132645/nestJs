import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CheckSmsDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.create(createUserDto);
  }

  @Post('sendSms')
  sendSms(@Body() phoneNumber: any): Promise<string> {
    // console.log(phoneNumber);
    return this.userService.sendSMS(String(phoneNumber.phoneNumber));
  }

  @Post('checkSms')
  checkSms(@Body() CheckSmsDto: CheckSmsDto): Promise<boolean> {
    return this.userService.checkSMS(
      CheckSmsDto.phoneNumber,
      CheckSmsDto.inputNumber,
    );
  }

  @Get()
  // @Role("admin")
  // @UseGuards(RolesGuard)
  // @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  // @Role("user")
  // @UseGuards(RolesGuard)
  // @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return this.userService.update(id, updateUserDto);
  }
}
