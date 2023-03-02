import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  Response,
  Request,
  Body, HttpStatus
} from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginUserDto, userIdDto } from "../user/dto/login-user.dto";

import cookie from 'cookie';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResponseMessage } from '../response.util';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() userData: LoginUserDto,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    // console.log(this.authService.login(req.user))

    const user = await this.userService.getById(userData.userId);
    // console.log(user);
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user);

    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user);
    // console.log(user);
    await this.userService.setCurrentRefreshToken(refreshToken, user);

    res.setHeader('Set-Cookie', [accessToken, refreshToken]);
    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);

    console.log(req.cookies)


    return await this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout') // async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
  async logout(@Req() req, @Res({ passthrough: true }) res): Promise<any> {

    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);

    // console.log(req.body.userId)
    const user = await this.userService.getById(req.body.userId);

    await this.userService.removeRefreshToken(user);
    // console.log(req)
    return  new ResponseMessage()
      .success()
      .body({
        result: '성공',
        expiresIn: 3600,
      })
      .build()
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Body() userData: userIdDto, @Req() req, @Res({ passthrough: true }) res) {
    // console.log(userData )
    const user = this.userService.getById(userData.userId);
    const { authorization } = req.headers;
    const { refreshToken, ...accessOption } =
      this.authService.getCookieWithJwtRefreshToken(user);

    // res.cookie('Authentication', userIdDto.currentHashedRefreshToken, accessOption);

    return this.authService
      .refreshAccessToken(userData.currentHashedRefreshToken, userData.userId)
      .then((result) => {
        res
          .status(HttpStatus.OK)
          .json(
            new ResponseMessage()
              .success()
              .body({
                result: result,
                expiresIn: 3600,
              })
              .build()
          );
      })
      .catch((e) => {
        console.log(e);
        res
          .status(HttpStatus.OK)
          .json(
            new ResponseMessage()
              .error(
                404,
                '리프레시 토큰이 유효하지않습니다..',
                '리프레시 토큰이 유효하지않습니다..',
              )
              .build()
          );
      });

    // return new ResponseMessage()
    //   .success()
    //   .body({
    //     user: user,
    //     expiresIn: 3600,
    //   })
    //   .build();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
