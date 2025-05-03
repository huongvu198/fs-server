import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketEvent } from './wss.enum';
import { OrderEntity } from 'src/entities/orders.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer()
  server: Server;

  // Gửi thông báo hết hạn thanh toán
  sendPaymentExpiredNotification(userId: number, orderId: string) {
    this.server
      .to(`user_${userId}`)
      .emit(SocketEvent.ORDER_PAYMENT_EXPIRED, { orderId });
  }

  sendOrderPaidNotification(userId: number, order: OrderEntity) {
    this.server
      .to(`user_${userId}`)
      .emit(SocketEvent.PAYMENT_SUCCESSFUL, { order });
  }

  // (Optional) Kết nối và join vào room userId
  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${userId}`);
    } else {
      this.logger.error('Missing userId, client will not join any room');
    }
  }
}
