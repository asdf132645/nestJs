import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExpiredError } from 'jsonwebtoken';
// import { RefreshToken } from 'src/entity/RefreshToken.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    // @InjectRepository(RefreshToken)
    // private refreshRepository: Repository<RefreshToken>,
  ) {
    this.jwtService = jwtService;
    this.userService = userService;
  }


  async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.user_id, sub: user.id };

    const opts = {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: '2h',
    };
    return this.jwtService.sign(payload, opts);
  }

  async generateTemporaryAccessToken(user: User): Promise<string> {
    const payload = { email: user.user_id, sub: user.id };

    const opts = {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: '3m',
    };
    return this.jwtService.sign(payload, opts);
  }

  async resolveAccessToken(encoded: string) {
    try {
      return this.jwtService.verify(encoded, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

}
