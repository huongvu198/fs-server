import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order-items.entity';
import { OrderEntity } from 'src/entities/orders.entity';
import { LessThan, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/order.dto';
import { CartService } from '../carts/carts.service';
import { VouchersService } from '../voucher/voucher.service';
import {
  DiscountType,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../utils/enum';
import { OrderItemMapper } from './order-items.mapper';
import { BankService } from '../payment-gateway/bank/bank.service';
import { VietQRService } from '../payment-gateway/vietqr/vietqr.service';
import {
  generateOrderCode,
  generateRandomCode,
} from '../../utils/helpers/common.helper';
import { config } from '../../config/app.config';
import { SocketGateway } from '../wss/socket.gateway';
const { term } = config.payment;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    private readonly cartService: CartService,
    private readonly vouchersService: VouchersService,
    private readonly bankService: BankService,
    private readonly vietQRService: VietQRService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async createOrder(cartId: string, userId: number, dto: CreateOrderDto) {
    const cart = await this.cartService.getCartToOrder(cartId, userId);

    if (!cart || !cart.items.length) {
      throw new BadRequestException('Giỏ hàng không hợp lệ hoặc trống');
    }

    let discount: number = 0;
    let type: DiscountType = DiscountType.FIXED;

    if (dto.voucherId) {
      const voucher = await this.vouchersService.applyVoucher(
        userId,
        dto.voucherId,
      );
      if (voucher.available) {
        discount = voucher.discount;
        type = voucher.type!;
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    let discountAmount = 0;

    if (type === DiscountType.FIXED) {
      discountAmount = discount;
    } else if (type === DiscountType.PERCENT) {
      discountAmount = (subtotal * discount) / 100;
    }

    const total = subtotal - discountAmount;

    const order = await this.orderRepository.save({
      userId,
      addressId: dto.addressId,
      voucherId: dto.voucherId,
      subtotal,
      discount,
      total,
      status:
        dto.paymentMethod === PaymentMethodEnum.BANKING
          ? OrderStatusEnum.PENDING
          : OrderStatusEnum.PROCESSING,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatusEnum.UNPAID,
      code: generateRandomCode(6),
      paymentExpiredAt: new Date(
        new Date().getTime() + Number(term) * 60 * 1000,
      ),
    });

    const orderItems = OrderItemMapper.toEntityList(cart.items, order);
    await this.orderItemsRepository.save(orderItems);
    await this.cartService.deleteAllCartItem(cartId);

    switch (dto.paymentMethod) {
      case PaymentMethodEnum.BANKING: {
        const bank = await this.bankService.getBankWithFurthestLastOrder();
        if (!bank) {
          throw new BadRequestException('Không có tài khoản thụ hưởng hợp lệ');
        }
        const QR = await this.vietQRService.generateQR({
          accountNo: bank.accountNo,
          accountName: bank.accountName,
          acqId: bank.acqId,
          amount: Number(total),
          addInfo: generateOrderCode(order.userId, order.createdAt, order.code),
        });
        this.startPaymentCountdown(order);
        return {
          type: PaymentMethodEnum.BANKING,
          order,
          qr: QR,
        };
      }

      case PaymentMethodEnum.COD: {
        this.vouchersService.useVoucher(userId, dto.voucherId);
        return {
          type: PaymentMethodEnum.COD,
          order,
          qr: null,
        };
      }

      default: {
        throw new BadRequestException('Phương thức thanh toán không hợp lệ');
      }
    }
  }

  private startPaymentCountdown(order: OrderEntity): void {
    const now = new Date();
    const expiryTime = new Date(order.paymentExpiredAt);
    const timeRemaining = expiryTime.getTime() - now.getTime();

    setTimeout(async () => {
      await this.cancelOrder(order);
      this.socketGateway.sendPaymentExpiredNotification(order.userId, order.id);
    }, timeRemaining);
  }

  // Hủy đơn hàng khi hết thời gian thanh toán
  private async cancelOrder(order: OrderEntity): Promise<void> {
    order.status = OrderStatusEnum.CANCELLED;
    order.paymentStatus = PaymentStatusEnum.UNPAID;
    await this.orderRepository.save(order);
    this.logger.log(
      `Order ${order.id} has been cancelled due to payment expiration.`,
    );
  }

  async cancelExpiredUnpaidOrders(): Promise<number> {
    const expiredTime = new Date(Date.now() - 15 * 60 * 1000);

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatusEnum.PENDING,
        paymentStatus: PaymentStatusEnum.UNPAID,
        createdAt: LessThan(expiredTime),
      },
    });

    for (const order of expiredOrders) {
      order.status = OrderStatusEnum.CANCELLED;
      await this.orderRepository.save(order);
    }

    return expiredOrders.length;
  }
}
