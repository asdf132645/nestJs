import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResponseMessage } from '../response.util';
import { ConfigService } from '@nestjs/config';
import bcrypt_1 from "bcrypt";

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
      user_id: user.user_id,
      userName: user.userName,
      // id: user.seq,
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
      user_id: user.user_id,
      userName: user.userName,
      // seq: user.seq,
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
      user_id: loginUserDto.user_id,
    });
    // console.log('user');

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

  async logout() {

  }

  async login(user: any) {
    // console.log(user === undefined);
    const payload = {
      id: user.id,
      user_id: user.user_id,
      userName: user.userName,
      role: user.role,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
      // refreshToken: user.currentHashedRefreshToken,
    };
    console.log(payload)
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
          access:{accessToken: this.jwtService.sign(payload),expiresIn: 3600,},
          role: payload.role,
          refresh:{
            refreshToken: this.jwtService.sign( payload, {
              secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
              expiresIn: `${this.configService.get(
                'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
              )}s`,
            }),
            expiresIn:86400,
          },

        })
        .build();
    }

    // console.log(user);
    // return {
    //   accessToken: this.jwtService.sign(payload),
    // };
  }

  async validateAccessToken(accessToken: string, userId: string) {
    const user = await this.userRepository.findOne({
      user_id: userId,
    });

    // if (!user.isActive) {
    //   return {
    //     isAuth: false,
    //     isActive: user.isActive,
    //   };
    // }

    // accessToken 이 만료 됐지만 refreshToken 은 기간중인 경우 Token 갱신
    const token = accessToken.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token);

    // accessToken 기간 체크
    const tokenExp = new Date(decoded['exp'] * 1000);
    const now = new Date();

    // 남은시간 (분)
    const betweenTime = Math.floor(
      (tokenExp.getTime() - now.getTime()) / 1000 / 60,
    );

    // 기간 만료된 경우 || 기간 얼마 안남은 경우
    if (betweenTime < 3) {
      // refreshToken 통신 유도
      return {
        user_id: user.user_id,
        isAuth: true,
        isRefresh: true,
      };
    }

    return {
      user_id: user.user_id,
      isAuth: true,
      isRefresh: false,
    };
  }

  async refreshAccessToken(authorization: string, userId: string) {
    const secretKey = process.env.JWT_REFRESH_TOKEN_SECRET
      ? process.env.JWT_REFRESH_TOKEN_SECRET
      : 'dev';
    const refreshToken = authorization.replace('Bearer ', '');
    const verify = this.jwtService.verify(refreshToken, { secret: secretKey });
    //refreshToken 만료 안된경우 accessToken 새로 발급
    if (verify) {
      const user = await this.userRepository.findOne({
        user_id: userId,
      });
      // console.log(user)
      const payload = {
        userId: user.user_id,
        userName: user.userName,
        // seq: user.seq,
        role: user.role,
        accountNumber: user.accountNumber,
        accountName: user.accountName,
      };
      // db에 저장된 토  큰과 비교
      // console.log(user.currentHashedRefreshToken == authorization)
      // if (user.currentHashedRefreshToken == authorization) {
        const token = this.jwtService.sign(payload);
      // const token = this.jwtService.sign(payload, {
      //   secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      //   expiresIn: `${this.configService.get(
      //     'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      //   )}s`,
      // });
        return {
          accessToken: token,
          expiresIn: 3600,
        };
      // }
    }

    // return {
    //   isAuth: false,
    // };
  }

}
