import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order-items.entity';
import { OrderEntity } from 'src/entities/orders.entity';
import { In, LessThan, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/order.dto';
import { CartService } from '../carts/carts.service';
import { VouchersService } from '../voucher/voucher.service';
import {
  DiscountType,
  InventoryModeEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  PointModeEnum,
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
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { TransactionBankEntity } from '../../entities/transactions.entity';
import { InventoryHelper } from 'src/modules/products/inventory.helper';
import { UsersService } from '../users/users.service';
import { UserAddressService } from '../users/user-address.service';
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
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly inventoryHelper: InventoryHelper,
    private readonly usersService: UsersService,
    private readonly userAddressService: UserAddressService,
  ) {}

  async createOrder(cartId: string, userId: number, dto: CreateOrderDto) {
    const cart = await this.cartService.getCartToOrder(cartId, userId);

    if (!cart || !cart.items.length) {
      throw new BadRequestException('Giỏ hàng không hợp lệ hoặc trống');
    }

    const address = await this.userAddressService.findOne(dto.addressId);

    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

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
        await this.vouchersService.useVoucher(userId, dto.voucherId);
      }
      if (!voucher.available) {
        throw new BadRequestException(voucher.message);
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const priceAfterDiscount = item.product.discount
        ? Number(item.product.price) * (1 - Number(item.product.discount) / 100)
        : Number(item.product.price);
      return sum + priceAfterDiscount * item.quantity;
    }, 0);

    let discountAmount = 0;

    if (type === DiscountType.FIXED) {
      discountAmount = discount;
    } else if (type === DiscountType.PERCENT) {
      discountAmount = (subtotal * discount) / 100;
    }

    let pointDiscount = 0;

    if (dto.point) {
      pointDiscount = Number(dto.point);
      await this.usersService.updatePoint(
        userId,
        pointDiscount,
        PointModeEnum.SUBTRACT,
      );
    }

    const total = subtotal - discountAmount - pointDiscount;

    const order = await this.orderRepository.save({
      userId,
      addressId: dto.addressId,
      address,
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
    await this.inventoryHelper.updateInventoryQuantities(
      orderItems,
      InventoryModeEnum.DECREASE,
    );

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
        this.startPaymentCountdown(order, orderItems, pointDiscount);
        console.log(
          'MessagePayment',
          ` ${generateOrderCode(order.userId, order.createdAt, order.code)} | 
          amount : ${Number(total)} `,
        );
        return {
          type: PaymentMethodEnum.BANKING,
          order,
          qr: QR,
        };
      }

      case PaymentMethodEnum.COD: {
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

  private startPaymentCountdown(
    order: OrderEntity,
    orderItems: OrderItemEntity[],
    pointDiscount: number,
  ): void {
    const now = new Date();
    const expiryTime = new Date(order.paymentExpiredAt);
    const timeRemaining = expiryTime.getTime() - now.getTime();

    setTimeout(async () => {
      await this.cancelOrder(order);
      await this.inventoryHelper.updateInventoryQuantities(
        orderItems,
        InventoryModeEnum.INCREASE,
      );
      if (order.voucherId) {
        await this.vouchersService.refundVoucher(order.userId, order.voucherId);
      }
      if (pointDiscount !== 0) {
        await this.usersService.updatePoint(
          order.userId,
          pointDiscount,
          PointModeEnum.ADD,
        );
      }
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

  async getOrderByUserId(userId: number, pagination: IPagination) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: [
        'items',
        'voucher',
        'address',
        'transactions',
        'items.product',
        'items.variant.images',
      ],
      skip: pagination.startIndex,
      take: pagination.perPage,
      order: { createdAt: 'DESC' },
    });

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return { headers: responseHeaders, items: orders };
  }

  async manualOrderCancellation(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: In([OrderStatusEnum.PROCESSING, OrderStatusEnum.PENDING]),
      },
      relations: ['items'],
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    await this.inventoryHelper.updateInventoryQuantities(
      order.items,
      InventoryModeEnum.INCREASE,
    );

    order.status = OrderStatusEnum.CANCELLED;
    await this.orderRepository.save(order);

    if (
      order.paymentStatus === PaymentStatusEnum.PAID &&
      order.paymentMethod === PaymentMethodEnum.BANKING
    ) {
      order.paymentStatus = PaymentStatusEnum.REFUNDED;
      const pointRefund = Number(order.total);
      await this.usersService.updatePoint(
        order.userId,
        pointRefund,
        PointModeEnum.ADD,
      );
      await this.orderRepository.save(order);
    }

    return order;
  }

  async handlePaymentOrder(
    userId: number,
    code: string,
    transactionId: string,
    transaction: TransactionBankEntity,
  ) {
    const order = await this.orderRepository.findOneBy({
      userId,
      code,
    });

    if (!order) {
      Logger.warn('Order not found');
      return;
    }

    order.transactionId = transactionId;
    order.transactions = transaction;
    order.status = OrderStatusEnum.PROCESSING;
    order.paymentStatus = PaymentStatusEnum.PAID;

    await this.orderRepository.save(order);

    await this.socketGateway.sendOrderPaidNotification(order.userId, order);
  }

  async getOrdersWithPaging(pagination: IPagination) {
    const excludedStatuses = [OrderStatusEnum.PENDING];
    const excludePaymentStatus = [PaymentStatusEnum.PENDING];

    const exclusionConditions = [
      {
        status: OrderStatusEnum.CANCELLED,
        paymentMethod: PaymentMethodEnum.BANKING,
        paymentStatus: PaymentStatusEnum.UNPAID,
      },
    ];

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.voucher', 'voucher')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('variant.images', 'images')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.status NOT IN (:...excludedStatuses)', { excludedStatuses })
      .andWhere('order.paymentStatus NOT IN (:...excludePaymentStatus)', {
        excludePaymentStatus,
      });

    exclusionConditions.forEach((condition, index) => {
      query.andWhere(
        `NOT (
        order.status = :status${index} AND
        order.paymentMethod = :paymentMethod${index} AND
        order.paymentStatus = :paymentStatus${index}
      )`,
        {
          [`status${index}`]: condition.status,
          [`paymentMethod${index}`]: condition.paymentMethod,
          [`paymentStatus${index}`]: condition.paymentStatus,
        },
      );
    });

    query
      .skip(pagination.startIndex)
      .take(pagination.perPage)
      .orderBy('order.createdAt', 'DESC');

    const [orders, total] = await query.getManyAndCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return { headers: responseHeaders, items: orders };
  }
}
