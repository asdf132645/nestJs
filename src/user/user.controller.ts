import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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
import { Response, ResponseMessage } from '../response.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.create(createUserDto);
  }

  @Post('sendSms')
  public async sendSms(@Body() phoneNumber: any): Promise<Response> {
    // console.log(phoneNumber);
    try {
      const result = this.userService.sendSMS(String(phoneNumber.phoneNumber));
      // console.log(result);
      return new ResponseMessage().success().body(result).build();
    } catch (e) {
      Logger.error(e);
    }
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
