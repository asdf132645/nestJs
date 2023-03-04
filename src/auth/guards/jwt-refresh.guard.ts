import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (authorization === undefined) {
      throw new HttpException('Token 전송 안됨', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.replace('Bearer ', '')
    request.user = this.validateToken(request.user,request);

    return true;
  }

  validateToken(user: any, request: any) {
    // console.log(request.body.userId)
    const refreshToken = request.cookies?.Refresh;
    // return this.usersService.getUserIfRefreshTokenMatches(
    //   refreshToken,
    //   request.body.userId,
    // );
  }
}