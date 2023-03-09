import { HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyInformation } from './company.entity';
import { Repository } from "typeorm";
import { createdCompanyDto } from "./dto/createdCompany";
import { Review } from '../review/Review.entity';
import { ResponseMessage } from "../response.util";
import { User } from "../user/entities/user.entity";
import { ReviewsService } from "../review/reviews.service";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyInformation) private companyRepository: Repository<CompanyInformation>,
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    private reviewsService: ReviewsService,
  ) {
    this.companyRepository = companyRepository;
    this.reviewRepository = reviewRepository;
    this.reviewsService = reviewsService;
  }

  async findAllCompany() {
    const companyList = await this.companyRepository
      .createQueryBuilder('company')
      .getRawMany();

    console.log(companyList);
    const companyListVar = [];
    if (companyList.length) {
      for (const rawCompany of companyList) {
        const avgRating = await this.reviewsService.getThisVidReviewAvgRate(
          rawCompany.company_id,
        );
        companyListVar.push({
          company_name: rawCompany.company_company_name,
          companyDescription: rawCompany.company_companyDescription,
          company_companyDetails: rawCompany.company_companyDetails,
          company_detail_address: rawCompany.company_detail_address,
          imgUrl: rawCompany.company_url,
          rating: avgRating,
          companyCode: String(rawCompany.company_companyCode)
        })
      }
    }
    return companyListVar;
  }

  async addThisCompany(newCompany: createdCompanyDto) {
    const company = new CompanyInformation();
    const randomBytes = require('crypto').randomBytes(2)
    const number = parseInt(randomBytes.toString('hex'), 16)

    company.company_name = newCompany.company_name;
    company.companyDescription = newCompany.companyDescription;
    company.email = newCompany.email;
    company.name = newCompany.name;
    company.phone = newCompany.phone;
    company.companyType = newCompany.companyType;
    company.companyDetails = newCompany.companyDetails;
    company.business_number = newCompany.business_number;
    company.address = newCompany.address;
    company.detail_address = newCompany.detail_address;
    company.url = newCompany.url;
    company.companyCode = "C" + number;
    await this.companyRepository.save(company);
    return new ResponseMessage().success().body({
      success: true,
      data: company,
    }).build();
  }

  async findComWithId(companyId: string) {
    return await this.companyRepository.findOne(companyId);
  }

  async findComWithCode(companyCode: string) {
    return await this.companyRepository.findOne({companyCode: companyCode});
  }

  async getThisComWithId(companyId) {
    return this.companyRepository.findOne({ id: companyId });
  }

  async getLessReviewVid() {
    const companyList = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.id')
      .addSelect('COUNT(review.id) as count')
      .leftJoin('company.reviews', 'review')
      .groupBy('company.id')
      .orderBy('count')
      .limit(5)
      .getRawMany();


    return companyList;
  }

  async getManyReviewVid() {
    const companyList = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.id')
      .leftJoin('company.reviews', 'review')
      .addSelect(`COUNT('reviews')`, 'count')
      .groupBy('company.id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return companyList;
  }

  async getUserCompany(userId: string) {
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.company', 'company')
      .getMany();

    const myCompanyBox = [];
    for (const review of reviews) {
      if (review.user.id === userId) {
        delete review.user;
        myCompanyBox.push(review.company);
      }
    }

    return myCompanyBox;
  }



  async getTop5ReviewVid() {
    const companyList = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.id')
      .addSelect('AVG(rating)', 'rating')
      .where('companyId = company.id')
      .from(Review, 'reviews')
      .groupBy('company.id')
      .orderBy('rating', 'DESC')
      .limit(5)
      .getRawMany();

    return companyList;
  }

  }

