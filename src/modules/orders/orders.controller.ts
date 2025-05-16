import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoleEnum } from '../../utils/enum';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { OrdersService } from './orders.service';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from '../../utils/pagination/pagination.decorator';

// @ApiBearerAuth()
// @Roles(RoleEnum.ADMIN)
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async getOrders(@Pagination() pagination: IPagination) {
    return await this.ordersService.getOrdersWithPaging(pagination);
  }
}
