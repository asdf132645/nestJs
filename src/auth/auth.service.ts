import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResponseMessage } from '../response.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getCookiesForLogOut() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  getCookieWithJwtRefreshToken(user: any) {
    const payload = {
      userId: user.userId,
      userName: user.userName,
      seq: user.seq,
      role: user.role,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) *
        1000,
    };
  }

  getCookieWithJwtAccessToken(user: any) {
    const payload = {
      userId: user.userId,
      userName: user.userName,
      seq: user.seq,
      role: user.role,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) *
        1000,
    };
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
      userId: loginUserDto.userId,
    });
    console.log('user');

    if (!user) {
      // throw new ForbiddenException({
      //   statusCode: HttpStatus.FORBIDDEN,
      //   message: [`등록되지 않은 사용자입니다.`],
      //   error: 'Forbidden',
      // });
      return 500;
    }

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (isMatch) {
      const { password, ...result } = user;
      return result;
    } else {
      // throw new ForbiddenException({
      //   statusCode: HttpStatus.FORBIDDEN,
      //   message: [`사용자 정보가 일치하지 않습니다.`],
      //   error: 'Forbidden',
      // });
      return 501;
    }
  }

  async login(user: any) {
    // console.log(user === undefined);
    const payload = {
      seq: user.seq,
      userId: user.userId,
      userName: user.userName,
      role: user.role,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
    };
    if (user === 500) {
      return new ResponseMessage()
        .error(
          404,
          '등록되지 않은 사용자입니다.',
          '등록되지 않은 사용자입니다.',
        )
        .build();
    } else if (user === 501) {
      return new ResponseMessage()
        .error(
          404,
          '사용자 정보가 일치하지 않습니다.',
          '사용자 정보가 일치하지 않습니다.',
        )
        .build();
    } else {
      return new ResponseMessage()
        .success()
        .body({
          accessToken: this.jwtService.sign(payload),
          role: payload.role,
          expiresIn: 3600,
        })
        .build();
    }

    // console.log(user);
    // return {
    //   accessToken: this.jwtService.sign(payload),
    // };
  }
}
