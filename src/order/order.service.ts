import { CACHE_MANAGER, ForbiddenException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Order } from "./order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { CreateUserDto } from "../user/dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { bcryptConstant } from "../common/constants";
import { CheckService, CreateOrderDto } from "./dto/createdOrder";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async orderListGet(id: string): Promise<Order> {
    return this.orderRepository.findOne({
      userId: id,
    });
  }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const result = await this.orderRepository.save(
      createOrderDto,
    );
    return result;
  }

  async getOrderData(checkService: CheckService): Promise<any> {
    const userid = checkService.userID;
    console.log(checkService.companyID)
    return await this.orderRepository
      .createQueryBuilder('order')
      .select("order")
      .where("userID = :userID", { userID: userid })
      .andWhere({
        createdAt: Between(
          new Date(checkService.startDate),
          new Date(checkService.endDate)
        ),
      }).getMany();

    // return await this.orderRepository.find({
    //   where: {
    //     createdAt: Between(
    //       new Date(2019, 5, 3),
    //       new Date(2022, 12, 3)
    //     ),
    //   }
    // })


  }

}

