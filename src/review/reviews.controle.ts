import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { CompanyService } from '../company/company.service';
import { ReviewDto } from './dto/postReviewDto';
import { ReviewsService } from './reviews.service';
import { TokenService } from "../auth/token.service";

@Controller('reviews')
export class ReviewsController {
  constructor(
    private reviewsService: ReviewsService,
    private CompanyService: CompanyService,
    private usersService: UserService,
    private tokenService: TokenService,
  ) {
    this.reviewsService = reviewsService;
    this.CompanyService = CompanyService;
    this.usersService = usersService;
    this.tokenService = tokenService;
  }
  @Get('reviewKing')
  async getReviewKing() {
    const kingData = await this.reviewsService.getReviewKing();
    delete kingData.user.password;
    delete kingData.user.user_id;

    return Object.assign({
      user: kingData.user,
      company: kingData.company,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('like')
  async likeThisReview(@Body() body, @Request() req) {
    const user = req.user;
    const review = await this.reviewsService.findReviewWithId(body.reviewId);
    if (!review) {
      throw new NotFoundException('존재하지 않는 리뷰입니다.');
    }
    return await this.reviewsService.addOrRemoveLike(user, review);
  }

  @Get(':companyCode')
  async findThisCompanyReview(
    @Param('companyCode') companyCode: string,
    @Query('page') page: number,
    @Headers() header,
  ): Promise<void> {
    let accessToken = null;
    let myuser;
    console.log(header.authorization)
    if (header.authorization) {
      const rawAccessToken = header.authorization;

      accessToken = await this.tokenService.resolveAccessToken(rawAccessToken.replace('Bearer ', ''));
      if (accessToken) {
        const { user_id } = accessToken;
        const { iat } = accessToken;
        // const accessTokenIat = new Date(iat * 1000 + 1000);
        myuser = await this.usersService.findUserWithUserId(user_id);
        console.log(myuser)
      }
    }

    const company = await this.CompanyService.findComWithCode(companyCode);
    // console.log(company)
    if (!accessToken) {
      myuser = 'guest';
    }

    const {
      companyList,
      resultUserReview,
    } = await this.reviewsService.findThisVidAndUserReview(company, myuser);
    let totalCount = companyList.length;
    if (resultUserReview) {
      totalCount++;
    }

    return Object.assign({
      totalCount,
      reviewList: companyList,
      myReview: resultUserReview || null,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('saveReview')
  async saveReview(@Body() body: ReviewDto, @Request() request): Promise<void> {
    // console.log(request.user)
    const user = request.user;
    if (!body.companyCode || !body.text || !body.rating) {
      throw new BadRequestException(
        'text 혹은 rating 혹은 Id가 전달되지 않았습니다.',
      );
    }
    const company = await this.CompanyService.findComWithCode(body.companyCode);
    return await this.reviewsService.saveReview(user, company, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteReview(@Body() body, @Request() req) {
    if (!body.reviewId)
      throw new BadRequestException('reviewId가 전달되지 않았습니다.');
    await this.reviewsService.deleteReview(body.reviewId);
    return '리뷰가 성공적으로 삭제 되었습니다.';
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async patchReview(@Body() body: ReviewDto, @Request() req): Promise<void> {
    const user = req.user;
    const video = await this.CompanyService.findComWithId(body.companyCode);
    if (!video) throw new BadRequestException('해당 비디오가 없습니다.');
    return await this.reviewsService.patchReview(user, video, body);
  }
}
