import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { AddToCartDto } from './dto/cart.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Carts')
@Controller({
  path: 'carts',
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/:userId')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@Param('userId') userId: string, @Body() dto: AddToCartDto) {
    return await this.cartService.addToCart(Number(userId), dto);
  }
}
