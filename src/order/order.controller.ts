import { Body, Controller, Post } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CheckService, CreateOrderDto } from "./dto/createdOrder";

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //서비스 생성
  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto): Promise<any> {
    return this.orderService.create(createOrderDto);
  }

  //서비스 조회
  @Post('checkService')
  checkService(@Body() checkService: CheckService): Promise<any> {
    console.log(checkService)
    return this.orderService.getOrderData(checkService);
  }
}
