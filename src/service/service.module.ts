import { Module, CacheModule } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntities } from './entities/service.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntities]),
    CacheModule.register({ ttl: 600, max: 1000 }),
  ],
  providers: [ServiceService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
