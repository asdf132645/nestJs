import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  CACHE_MANAGER,
  UseInterceptors,
  CacheInterceptor,
  Inject,
  InternalServerErrorException,
  HttpException,
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
import { ResponseData, ResponseMessage } from '../response.util';
import { compare, hash } from 'bcrypt';
import { Order } from "../order/order.entity";
import { uploadFileURL } from "../utils/multer.options";
import * as fs from 'fs';
import { extname } from "path";


// const ACCESS_KEY_ID = process.env.NAVER_ACCESS_KEY_ID;
// const SECRET_KEY = process.env.NAVER_SECRET_KEY;
// const SMS_SERVICE_ID = process.env.NAVER_SMS_SERVICE_ID;

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
    // @InjectRepository(Order)
    // private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async setCurrentRefreshToken(refreshToken: string, user: any) {
    const currentHashedRefreshToken = await hash(refreshToken, 10);
    await this.userRepository.update(user, { currentHashedRefreshToken });
  }

  async removeRefreshToken(user: any) {
    // console.log(user)
    return this.userRepository.update(user, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
    // console.log(user);
    const isRefreshTokenMatching = await compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async getById(id: string) {
    // const order = this.orderRepository
    //   .createQueryBuilder("order");

    const user = await this.userRepository.findOne({
      user_id: id,
    });
    console.log(id);
    if (user) {
      return user;
    }
    throw new HttpException('없는 아이디입니다.', HttpStatus.NOT_FOUND);
  }

  // SMS 인증 위한 시그니쳐 생성 로직
  makeSignitureForSMS = (): string => {
    // console.log(process.env.NAVER_SMS_SERVICE_ID);
    const message = [];
    const hmac = crypto.createHmac(
      'sha256',
      String(process.env.NAVER_SECRET_KEY),
    );
    const timeStamp = Date.now().toString();
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';

    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/ncp:sms:kr:275253326456:solve/messages`);
    message.push(newLine);
    message.push(timeStamp);
    message.push(newLine);
    message.push(process.env.NAVER_ACCESS_KEY_ID);
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
    // console.log(  + '시시시');
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
        'x-ncp-iam-access-key': process.env.NAVER_ACCESS_KEY_ID,
        'x-ncp-apigw-signature-v2': signiture,
      },
    };

    // 문자 보내기 (url)
    axios
      .post(
        `https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:275253326456:solve/messages`,
        body,
        options,
      )
      .then(async (res) => {
        // 성공 이벤트
        return '';
      })
      .catch((err) => {
        console.error(err);
        // return err;
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: [`메시지 앱 호출 에러`],
          error: 'Forbidden',
        });
      });

    // 캐시 추가하기
    await this.cacheManager.set(phoneNumber, checkNumber);
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
      user_id: createUserDto.user_id,
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
        'user_id',
        'userName',
        'role',
        'accountNumber',
        'accountName',
      ],
    });
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOne(
      { user_id: id },
      {
        // 검색할 열을 지정
        select: [
          'user_id',
          'userName',
          'role',
          'accountNumber',
          'accountName',
        ],
      },
    );
  }

  myPage(id: string): Promise<User> {
    return this.userRepository.findOne(
      { user_id: id },
      {
        // 검색할 열을 지정
        select: [
          'user_id',
          'userName',
          'role',
        ],
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    const isExist = await this.userRepository.findOne({ user_id: id });
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

  /**
   * @author Ryan
   * @description 디스크 방식 파일 업로드 (1)
   *
   * @param files 파일 데이터
   * @returns {String[]} 파일 경로
   */
  uploadFileDisk(files: File[]): string[] {
    return files.map((file: any) => {
      //파일 이름 반환
      return uploadFileURL(file.filename);
    });
  }

  /**
   * @author Ryan
   * @description 디스크 방식 파일 업로드 (2)
   *
   * @param user_id 유저 아이디
   * @param files 파일 데이터
   * @returns {String[]} 파일 경로
   */
  uploadFileDiskDestination(userId: string, files: File[]): string[] {
    //유저별 폴더 생성
    const uploadFilePath = `uploads/${userId}`;

    if (!fs.existsSync(uploadFilePath)) {
      // uploads 폴더가 존재하지 않을시, 생성합니다.
      fs.mkdirSync(uploadFilePath);
    }
    return files.map((file: any) => {
      //파일 이름
      const fileName = Date.now() + extname(file.originalname);
      //파일 업로드 경로
      const uploadPath =
        __dirname + `/../../${uploadFilePath + '/' + fileName}`;

      //파일 생성
      fs.writeFileSync(uploadPath, file.path); // file.path 임시 파일 저장소

      return uploadFileURL(uploadFilePath + '/' + fileName);
    });
  }

  /**
   * @author Ryan
   * @description 메모리 방식 파일 업로드
   *
   * @param userId 유저 아이디
   * @param files 파일 데이터
   * @returns {String[]} 파일 경로
   */
  uploadFileMemory(userId: string, files: File[]): any {
    //유저별 폴더 생성
    const uploadFilePath = `uploads/${userId}`;

    if (!fs.existsSync(uploadFilePath)) {
      // uploads 폴더가 존재하지 않을시, 생성합니다.
      fs.mkdirSync(uploadFilePath);
    }

    return files.map((file: any) => {
      //파일 이름
      const fileName = Date.now() + extname(file.originalname);
      //파일 업로드 경로
      const uploadPath =
        __dirname + `/../../${uploadFilePath + '/' + fileName}`;

      //파일 생성
      fs.writeFileSync(uploadPath, file.buffer);

      //업로드 경로 반환
      return uploadFileURL(uploadFilePath + '/' + fileName);
    });
  }
}
