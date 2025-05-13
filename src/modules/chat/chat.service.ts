import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../entities/message.entity';
import { ConversationEntity } from '../../entities/conversations.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,

    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,

    private readonly usersService: UsersService,
  ) {}

  // Tạo hoặc lấy cuộc trò chuyện giữa client và admin
  async getOrCreateConversation(userId: number): Promise<ConversationEntity> {
    let conversation = await this.conversationRepo.findOne({
      where: { clientId: userId, isClosed: false },
    });

    const admin = await this.usersService.findRootAdmin(); // Hàm tìm admin chính

    if (!conversation) {
      conversation = this.conversationRepo.create({
        clientId: userId,
        adminId: admin?.id,
      });

      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  // Lưu tin nhắn vào DB
  async createMessage(data: {
    conversationId: string;
    senderId: number;
    content: string;
  }): Promise<MessageEntity> {
    console.log('createMessage', data);
    const conversation = await this.conversationRepo.findOne({
      where: { id: data.conversationId },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const sender = await this.usersService.findById(data.senderId);
    const message = this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      sender: sender!,
      content: data.content,
    });

    conversation.lastMessageAt = new Date();
    await this.conversationRepo.save(conversation);

    return this.messageRepo.save(message);
  }

  // Lấy toàn bộ tin nhắn trong 1 cuộc trò chuyện
  async getMessages(conversationId: string): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }
}
