import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { CartService } from '../carts/carts.service';
import { CreateOrderDto } from './dto/order.dto';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Orders-Public')
@Controller({
  path: 'orders-public',
  version: '1',
})
export class OrderController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.id;
    const cartId = await this.cartService.getCartIdByUserId(Number(userId));
    return await this.ordersService.createOrder(cartId, userId, dto);
  }
}
