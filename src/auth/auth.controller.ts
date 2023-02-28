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
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';

import cookie from 'cookie';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() userData: LoginUserDto,@Req() req, @Res({ passthrough: true }) res) {
    // console.log(this.authService.login(req.user))


    const user = await this.userService.getById(userData.userId);
    console.log(user);
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user);

    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user);
    console.log(user);
    await this.userService.setCurrentRefreshToken(refreshToken, user);

    // req.res.setHeader('Set-Cookie', [accessToken, refreshToken]);
    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.login(user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout') // async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
  async logout(@Req() req, @Res() res): Promise<any> {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(req.user.id);

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res) {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);
    res.cookie('Authentication', accessToken, accessOption);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
