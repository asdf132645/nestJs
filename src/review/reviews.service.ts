import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeReview } from './LikeReview.entity';
import { Review } from './Review.entity';
import { User } from '../user/entities/user.entity';
import { CompanyInformation } from '../company/company.entity';
import { Repository } from 'typeorm';
import { ReviewDto } from './dto/postReviewDto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(LikeReview)
    private likeRepository: Repository<LikeReview>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CompanyInformation) private companyInformationRepository: Repository<CompanyInformation>,
  ) {
    this.reviewRepository = reviewRepository;
    this.likeRepository = likeRepository;
    this.userRepository = userRepository;
    this.companyInformationRepository = companyInformationRepository;
  }

  async getReviewKing() {
    const test = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review')
      .addSelect('COUNT(likeReview.id) as likeCount')
      .leftJoin('review.likeReview', 'likeReview')
      .groupBy('review.id')
      .orderBy('likeCount', 'DESC')
      .getOne();

    return await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.company', 'company')
      .where('review.id =:id', { id: test.id })
      .getOne();
  }

  async getThisVidReviewAvgRate(companyCode: string) {
    // 비디오 컨트롤러에서 평균 별점을 낼 때 사용하는 로직
    const avgRating = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.company', 'company')
      .where('company.companyCode = :companyCode', { companyCode })
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    if (avgRating === null) return 0;
    else return Number(avgRating.avg);

  }

  async getThisComReviewAvgRate(companyCode: string) {
    // 비디오 컨트롤러에서 평균 별점을 낼 때 사용하는 로직
    const avgRating = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.company', 'company')
      .where('company.companyCode = :companyCode', { companyCode })
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    if (avgRating === null) return 0;
    else return Number(avgRating.avg);

  }

  async addOrRemoveLike(user: User, review: Review) {
    const userLike = await this.likeRepository.findOne({ user, review });
    if (userLike) {
      await this.likeRepository.delete({ user, review });
      const likeCount = await this.likeRepository.count({ review });
      const isLike = await this.likeRepository.count({
        user,
        review,
      });
      const returnReview = { ...review, likeCount, isLike };
      return Object.assign({
        review: returnReview,
        message: 'Success deleted',
      });
    } else {
      const likeReview = new LikeReview();
      likeReview.user = user;
      likeReview.review = review;
      await this.likeRepository.save(likeReview);
      const likeCount = await this.likeRepository.count({ review });
      const isLike = await this.likeRepository.count({
        user,
        review,
      });
      const returnReview = { ...review, likeCount, isLike };
      return Object.assign({
        review: returnReview,
        message: 'Success created',
      });
    }
  }

  async findReviewWithId(reviewId: number) {
    return await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.id = :id', { id: reviewId })
      .leftJoinAndSelect('review.user', 'user')
      .getOne();
  }

  async findThisVidAndUserReview(company: any, user) {
    // console.log(company)
    // console.log(user)
    if (user === 'guest') {
      user = await this.userRepository.findOne({ userName: 'guest' });
    }
    // const rawVideoList = await this.reviewRepository
    //   .createQueryBuilder('review')
    //   .leftJoinAndSelect('review.user', 'user')
    //   .where({ video })
    //   .andWhere('user.id != :id', { id: user.id })
    //   .orderBy('review.createdAt', 'DESC')
    //   .getMany();

    const rawCompanyList = await this.reviewRepository
      .createQueryBuilder('review')
      // .select('*')
      // // .select('review.video')
      // // .where('review.video.id =:id', { id: video.id })
      // .addSelect('COUNT(*)', 'likeCount')
      // .where({ video })
      // .andWhere('reviewId = review.id')
      // .leftJoin(LikeReview, 'like')
      // .groupBy('review.id')
      // .orderBy('likeCount', 'DESC')
      // .getRawMany();
      .select('review')
      .addSelect('COUNT(likeReview.id) as likeCount')
      .leftJoin('review.likeReview', 'likeReview')
      .where({ company })
      .groupBy('review.id')
      .orderBy('likeCount', 'DESC')
      .getRawMany();
      // console.log(rawCompanyList)
    // .createQueryBuilder('platformUsers')
    // .select('platformUsers.id')
    // .addSelect('COUNT(userLikes.id) as userLikesCount')
    // .leftJoin('platformUsers.userLikes', 'userLikes')
    // .groupBy('platformUsers.id')
    // .orderBy('userLikesCount', 'DESC')
    // .execute();

    const userReview = await this.reviewRepository.findOne({ user, company });
    const companyList = [];

    if (rawCompanyList.length) {
      for (const rawReview of rawCompanyList) {
        const review = await this.reviewRepository.findOne({
          id: rawReview.review_id,
        });

        if (userReview && rawReview.review_id === userReview.id) continue;
        const likeCount = rawReview.likeCount;
        const isLike = await this.likeRepository.count({ user, review });
        const reviewUser = await this.userRepository.findOne({
          id: rawReview.review_userId,
        });
        delete reviewUser.password;

        companyList.push({
          id: rawReview.review_id,
          rating: rawReview.review_rating,
          text: rawReview.review_text,
          createdAt: rawReview.review_createdAt,
          updatedAt: rawReview.review_updatedAt,
          user: reviewUser,
          companyCode: rawReview.review_companyCode,
          likeCount,
          isLike,
        });
      }
    } else {
      return { companyList: companyList, userReview: null };
    }

    if (!userReview) {
      return {
        companyList: companyList,
        userReview: null,
      };
    }

    const resultUserReview = {
      ...userReview,
      likeCount: await this.likeRepository.count({ review: userReview }),
      isLike: await this.likeRepository.count({ user, review: userReview }),
    };
    return { companyList: companyList, resultUserReview };
  }

  async saveReview(user: User, company: CompanyInformation, req: ReviewDto) {
    const isExist = await this.reviewRepository.findOne({ user, company });
    // console.log(company)
    // if (isExist) {
    //   throw new UnprocessableEntityException('이미 리뷰가 존재합니다!.');
    // } else {
      const reviews = new Review();
      reviews.text = req.text;
      reviews.rating = req.rating;
      reviews.reviewImg = req.reviewImg;
      reviews.companyCode = req.companyCode;
      reviews.user = user;
      reviews.company = company;
      await this.reviewRepository.save(reviews);
      delete reviews.user;
      delete reviews.company;
      const returnReview = {
        ...reviews,
        likeCount: 0,
        isLike: 0,
      };
      return Object.assign({
        myReview: returnReview,
        message: '리뷰가 등록되었습니다.',
      });
    // }
  }

  async deleteReview(id: number) {
    const isReview = this.reviewRepository.find({ id });
    if (!isReview)
      throw new UnprocessableEntityException('해당 리뷰가 존재하지 않습니다.');
    await this.reviewRepository.delete({ id: id });
  }

  async patchReview(user: User, company: CompanyInformation, req: ReviewDto) {
    const review = await this.reviewRepository.findOne({ user, company });
    const id = review.id;
    const likeCount = await this.likeRepository.count({ review });
    const isLike = await this.likeRepository.count({
      user,
      review,
    });

    await this.deleteReview(id);

    const thisreview = {
      id,
      text: req.text,
      rating: req.rating,
      user,
      company,
    };
    await this.reviewRepository.save(thisreview);
    delete thisreview.user;
    delete thisreview.company;
    return Object.assign({
      myReview: {
        ...thisreview,
        likeCount,
        isLike,
      },
      message: '리뷰가 수정되었습니다.',
    });
  }
}
