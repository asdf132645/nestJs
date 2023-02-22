import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  CACHE_MANAGER,
  UseInterceptors,
  CacheInterceptor,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { bcryptConstant } from '../common/constants';
import axios from 'axios';
import * as crypto from 'crypto';

const ACCESS_KEY_ID = 'PC0azj722QCCJFcLkoLL';
const SECRET_KEY = 'l6DGnUyDqzUTSdnUuzDAJkcW9gCCKst8zNHVvbIa';
const SMS_SERVICE_ID = 'ncp:sms:kr:275253326456:solve';

interface SMS {
  type: string;
  contentType: string;
  countryCode: string;
  from: string;
  content: string;
  messages: any;
}

@Injectable()
@UseInterceptors(CacheInterceptor)
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  // SMS 인증 위한 시그니쳐 생성 로직
  makeSignitureForSMS = (): string => {
    const message = [];
    console.log(SECRET_KEY);
    const hmac = crypto.createHmac('sha256', String(SECRET_KEY));
    const timeStamp = Date.now().toString();
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';

    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${SMS_SERVICE_ID}/messages`);
    message.push(newLine);
    message.push(timeStamp);
    message.push(newLine);
    message.push(ACCESS_KEY_ID);
    // 시그니쳐 생성
    const signiture = hmac.update(message.join('')).digest('base64');
    // string 으로 반환
    return signiture.toString();
  };

  // 무작위 6자리 랜덤 번호 생성하기
  makeRand6Num = (): number => {
    const randNum = Math.floor(Math.random() * 1000000);
    return randNum;
  };

  // SMS 발송 로직
  sendSMS = async (phoneNumber: string) => {
    console.log(phoneNumber);
    // TODO : 1일 5회 문자인증 초과했는지 확인하는 로직 필요!
    const signiture = this.makeSignitureForSMS();
    // 캐시에 있던 데이터 삭제
    await this.cacheManager.del(phoneNumber);
    // 난수 생성 (6자리로 고정)
    const checkNumber = this.makeRand6Num().toString().padStart(6, '0');

    // 바디 제작
    const body: SMS = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: '01027019291',
      content: `인증번호는 [${checkNumber}] 입니다.`,
      messages: [
        {
          to: phoneNumber,
        },
      ],
    };

    // 헤더 제작
    const options = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': Date.now().toString(),
        'x-ncp-iam-access-key': ACCESS_KEY_ID,
        'x-ncp-apigw-signature-v2': signiture,
      },
    };

    // 문자 보내기 (url)
    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${SMS_SERVICE_ID}/messages`,
        body,
        options,
      )
      .then(async (res) => {
        // 성공 이벤트
      })
      .catch((err) => {
        console.error(err.response.data);
        throw new InternalServerErrorException();
      });
    // 캐시 추가하기
    await this.cacheManager.set(phoneNumber, checkNumber);
    return 'send end!';
  };

  // SMS 확인 로직, 문자인증은 3분 이내에 입력해야지 가능합니다!
  checkSMS = async (
    phoneNumber: string,
    inputNumber: string,
  ): Promise<boolean> => {
    const sentNumber = (await this.cacheManager.get(phoneNumber)) as string;
    if (sentNumber === inputNumber) return true;
    else return false;
  };

  async create(createUserDto: CreateUserDto): Promise<any> {
    const isExist = await this.userRepository.findOne({
      userId: createUserDto.userId,
    });
    if (isExist) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`이미 등록된 사용자입니다.`],
        error: 'Forbidden',
      });
    }
    // hash 내장메서드 설명
    // createUserDto.password, = 암호화할 데이터
    // bcryptConstant.saltOrRounds = 비교할 데이터
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      bcryptConstant.saltOrRounds,
    );
    const { password, ...result } = await this.userRepository.save(
      createUserDto,
    );
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'seq',
        'userId',
        'userName',
        'role',
        'accountNumber',
        'accountName',
      ],
    });
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOne(
      { userId: id },
      {
        // 검색할 열을 지정
        select: [
          'seq',
          'userId',
          'userName',
          'role',
          'accountNumber',
          'accountName',
        ],
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    const isExist = await this.userRepository.findOne({ userId: id });
    if (!isExist) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`사용자 등록을 먼저 해주세요.`],
        error: 'Forbidden',
      });
    }
    if (updateUserDto.password !== undefined) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        bcryptConstant.saltOrRounds,
      );
    }
    await this.userRepository.update(id, updateUserDto);
  }
}
