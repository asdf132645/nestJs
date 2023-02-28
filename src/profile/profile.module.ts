import { Module, CacheModule } from '@nestjs/common';
import { ProfileService } from './profile.sevice';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    CacheModule.register({ ttl: 600, max: 1000 }),
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
