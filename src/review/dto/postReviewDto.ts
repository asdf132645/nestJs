import { IsNumber, IsString } from "class-validator";

export class ReviewDto {
  @IsString()
  text: string;

  @IsString()
  companyCode: string;

  @IsNumber()
  rating: number;

  @IsString()
  reviewImg:string;

  // private _reviewText: string;
  // private _videoId: number;
  // private _rating: number;

  // constructor(reviewText: string, videoId: number, rating: number) {
  //   this._reviewText = reviewText;
  //   this._videoId = videoId;
  //   this._rating = rating;
  // }

  // get reviewText(): string {
  //   return this._reviewText;
  // }

  // set reviewText(value: string) {
  //   this._reviewText = value;
  // }

  // get videoId(): number {
  //   return this._videoId;
  // }

  // set videoId(value: number) {
  //   this._videoId = value;
  // }

  // get rating(): number {
  //   return this._rating;
  // }

  // set rating(value: number) {
  //   this._rating = value;
  // }
}
