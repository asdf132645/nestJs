import { Module, CacheModule } from '@nestjs/common';
import { CompanySevice } from './company.sevice';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInformation } from './company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyInformation]),
    CacheModule.register({ ttl: 600, max: 1000 }),
  ],
  providers: [CompanySevice],
  controllers: [CompanyController],
  exports: [CompanySevice],
})
export class CompanyModule {}
