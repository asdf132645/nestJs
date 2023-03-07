import { HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyInformation } from './company.entity';
import { Repository } from "typeorm";
import { createdCompanyDto } from "./dto/createdCompany";
import { Review } from '../review/Review.entity';
import { ResponseMessage } from "../response.util";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyInformation) private companyRepository: Repository<CompanyInformation>,
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
  ) {
    this.companyRepository = companyRepository;
    this.reviewRepository = reviewRepository;
  }

  async addThisCompany(newCompany: createdCompanyDto) {
    const company = new CompanyInformation();

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
    await this.companyRepository.save(company);
    return new ResponseMessage().success().body({
      success: true,
      data: company,
    }).build();
  }

  async findComWithId(companyId: string) {
    return await this.companyRepository.findOne(companyId);
  }

  async getThisComWithId(companyId) {
    return this.companyRepository.findOne({ id: companyId });
  }

  async getLessReviewVid() {
    const videoList = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.id')
      .addSelect('COUNT(review.id) as count')
      .leftJoin('video.reviews', 'review')
      .groupBy('company.id')
      .orderBy('count')
      .limit(5)
      .getRawMany();

    console.log(videoList);

    return videoList;
  }

  async getUserCompany(userId: string) {
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.video', 'video')
      .getMany();

    const myVideoBox = [];
    for (const review of reviews) {
      if (review.user.id === userId) {
        delete review.user;
        myVideoBox.push(review.company);
      }
    }

    return myVideoBox;
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

