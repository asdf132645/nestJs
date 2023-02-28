import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntities } from './entities/service.entities';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(ServiceEntities)
    private serviceRepository: Repository<ServiceEntities>,
  ) {}

}
