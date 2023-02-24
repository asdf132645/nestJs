import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import cookie from 'cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    // console.log(this.authService.login(req.user))
    // return this.authService.login(req.user);

    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    res.setHeader;

    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);

    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(req.user.id);

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
