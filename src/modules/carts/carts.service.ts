import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/entities/carts.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';
import { CartItemEntity } from 'src/entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async addToCart(userId: number, productData: AddToCartDto) {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    const [variant, size, product] = await Promise.all([
      this.productsService.validateProduct(productData.productId),
      this.productsService.validateVariant(productData.variantId),
      this.productsService.validateSize(
        productData.sizeId,
        productData.quantity,
      ),
    ]);

    const existingItem = cart.items.find(
      (item) =>
        item.variant.id === variant.id &&
        item.size.id === size.id &&
        item.product.id === product.id,
    );

    if (existingItem) {
      existingItem.quantity += productData.quantity;
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        variant,
        size,
        quantity: productData.quantity,
      });
      cart.items.push(newItem);
    }

    return this.cartRepository.save(cart);
  }
}
