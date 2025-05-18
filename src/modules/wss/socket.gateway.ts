import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './wss.enum';
import { OrderEntity } from '../../entities/orders.entity';
import { MessageEntity } from '../../entities/message.entity';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Gửi thông báo hết hạn thanh toán
  sendPaymentExpiredNotification(userId: number, order: OrderEntity) {
    this.server
      .to(`user_${userId}`)
      .emit(SocketEvent.ORDER_PAYMENT_EXPIRED, { order });
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

  @SubscribeMessage(SocketEvent.JOIN_CONVERSATION)
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage(SocketEvent.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: number;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Lưu tin nhắn vào DB
    const savedMessage: MessageEntity =
      await this.chatService.createMessage(data);

    // 2. Gửi cho tất cả client trong room conversation
    this.server
      .to(`conversation_${data.conversationId}`)
      .emit(SocketEvent.NEW_MESSAGE, savedMessage);
  }
}
