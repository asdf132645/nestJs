import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { ReviewsService } from "../review/reviews.service";
import { UserService } from "../user/user.service";
import { TokenService } from '../auth/token.service';
import { ResponseMessage } from "../response.util";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../user/entities/user.entity";
import { CompanyInformation } from "./company.entity";

@Controller("company")
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private reviewsService: ReviewsService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {
    this.companyService = companyService;
    this.reviewsService = reviewsService;
    this.userService = userService;
    this.tokenService = tokenService;

  }

  @Get("/companyList")
  async getCompanyList(
    @Query("path") path: string,
    @Query("q") q: string,
    @Headers() header
  ) {
    let user = null;
    let accessToken = null;

    if (header.authorization) {
      const rawAccessToken = header.authorization.slice(7);
      accessToken = await this.tokenService.resolveAccessToken(rawAccessToken);
      if (accessToken) {
        const { user_id } = accessToken;
        const { iat } = accessToken;
        const accessTokenIat = new Date(iat * 1000 + 1000);
        user = this.userService.findUserWithUserId(user_id);

      }
    }

    const companyList = await this.companyService.getManyReviewVid();
    const many5ReviewVidBox = [];
    for (const company of companyList) {
      const manyVid = await this.companyService.getThisComWithId(
        company.company_id,
      );
      const avgRating = await this.reviewsService.getThisVidReviewAvgRate(
        company.company_id,
      );
      many5ReviewVidBox.push({
        ...manyVid,
        rating: avgRating,
      });
    }


    const companyList2 = await this.companyService.getLessReviewVid();
    const less5ReviewVidBox = [];
    for (const company of companyList2) {
      const lowVid = await this.companyService.getThisComWithId(
        company.company_id,
      );
      const avgRating = await this.reviewsService.getThisVidReviewAvgRate(
        company.company_id,
      );
      less5ReviewVidBox.push({
        ...lowVid,
        rating: avgRating,
      });
    }

    const companyList3 = await this.companyService.getTop5ReviewVid();
    const top5ReviewVidBox = [];
    for (const company of companyList3) {
      const topVid = await this.companyService.getThisComWithId(company.id);
      const avgRating = await this.reviewsService.getThisVidReviewAvgRate(
        company.id,
      );
      top5ReviewVidBox.push({
        ...topVid,
        rating: avgRating,
      });
    }

    const companyListMain =  await this.companyService.findAllCompany();
    const listMain = [];
    for (const company of companyListMain){
      listMain.push(company)
    }


    // console.log(this.companyService.findAllCompany())
    return new ResponseMessage().success().body({
      success: true,
      data: {
        companyList: listMain,
        // top5VideoList: top5ReviewVidBox,
        // mostReviewVidList: many5ReviewVidBox,
        // lessReviewVidList: less5ReviewVidBox,
      },
    }).build();
  }
  @Get('list')
  findAll(): Promise<CompanyInformation[]> {
    return this.companyService.findAllCompany();
  }

  // @UseGuards(JwtAuthGuard)
  @Post('add')
  async addVideo(@Body() body, @Request() req) {
    // const user = req.user;
    // const admin = await this.userService.findUserWithUserId('admin');
    // delete admin.password;

    return await this.companyService.addThisCompany(body);

    // if (user.id === admin.id && user.email === admin.email) {
    //   return await this.companyService.addThisCompany(body);
    // } else {
    //   throw new UnauthorizedException('허가되지 않은 사용자입니다.');
    // }
  }

}
