import {
  Bind,
  Body,
  Controller,
  Delete,
  Get, HttpStatus,
  Logger,
  Param,
  Post,
  Put, Res, UploadedFiles,Response,
  UseGuards, UseInterceptors
} from "@nestjs/common";
import { UserService } from './user.service';
import { CreateUserDto, CheckSmsDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseData, ResponseMessage } from '../response.util';
import { FilesInterceptor } from "@nestjs/platform-express";
import {   multerDiskOptions,
  multerDiskDestinationOutOptions,
  multerMemoryOptions,} from '../utils/multer.options';
import { HttpExceptionFilter } from '../utils/http-exception.filter';

let userId = '';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.create(createUserDto);
  }

  @Post('sendSms')
  public async sendSms(@Body() phoneNumber: any): Promise<ResponseData> {
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

  @Post('myPage')
  myPage(@Body() id:string): Promise<User> {
    return this.userService.myPage(id);
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

  /**
   * @author Ryan
   * @description 디스크 방식 파일 업로드 (1)-> Destination 옵션 설정
   *
   * @param {File[]} files 다중 파일
   * @param res Response 객체
   */
  @Post('/disk_upload1')
  @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadFileDisk(files: File[], @Res() res: Response) {
    console.log(files)
    return new ResponseMessage().success().body({
      success: true,
      data: this.userService.uploadFileDisk(files),
    }).build();
  }

  /**
   * @author Ryan
   * @description 디스크 방식 파일 업로드 (2)-> Destination 옵션 미설정
   *
   * @param {File[]} files 다중 파일
   * @param  user_id 유저 아이디
   * @param res Response 객체
   */
  @Post('/disk_upload2')
  @UseInterceptors(
    FilesInterceptor('files', null, multerDiskDestinationOutOptions),
  )
  @Bind(UploadedFiles())
  uploadFileDiskDestination(
    files: File[],
    @Body('user_id') user_id: string,
    @Res() res: Response,
  ) {
    if (user_id != undefined) {
      user_id = user_id;
    }
    return new ResponseMessage().success().body({
      success: true,
      data: this.userService.uploadFileDiskDestination(user_id, files),
    }).build();
  }

  /**
   * @author Ryan
   * @description 메모리 방식 파일 업로드
   *
   * @param {File[]} files 다중 파일
   * @param  user_id 유저 아이디
   * @param res Response 객체
   */
  @Post('/memory_upload')
  @UseInterceptors(FilesInterceptor('files', null, multerMemoryOptions))
  @Bind(UploadedFiles())
  uploadFileMemory(
    files: File[],
    @Body('userId') user_id: string,
    @Res() res: Response,
  ) {
    if (user_id != undefined) {
      userId = user_id;
    }
    return new ResponseMessage().success().body({
      success: true,
      data: this.userService.uploadFileMemory(userId, files),
    }).build();
  }
}
