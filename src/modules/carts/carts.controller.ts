import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { AddToCartDto } from './dto/cart.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller({
  path: 'cart',
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/:userId')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@Param('userId') userId: string, @Body() dto: AddToCartDto) {
    return await this.cartService.addToCart(Number(userId), dto);
  }

  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  async getCartByUser(@Param('userId') userId: string) {
    return await this.cartService.getCartByUser(Number(userId));
  }

  @Post('import/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: AddToCartDto, isArray: true })
  async addManyToCart(
    @Param('userId') userId: string,
    @Body() dto: AddToCartDto[],
  ) {
    return await this.cartService.addManyToCart(Number(userId), dto);
  }

  @Delete('item/:itemId')
  @HttpCode(HttpStatus.OK)
  async deleteCartItem(@Param('itemId') itemId: string) {
    return await this.cartService.deleteCartItem(itemId);
  }

  @Delete('all-item/:cartId')
  @HttpCode(HttpStatus.OK)
  async deleteAllCartItem(@Param('cartId') cartId: string) {
    return await this.cartService.deleteAllCartItem(cartId);
  }
}
