import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Tạo hoặc lấy cuộc trò chuyện
  @Post('conversation')
  async getOrCreateConversation(@Req() req: any) {
    const userId = req.user.id;
    return this.chatService.getOrCreateConversation(userId);
  }

  // Lấy tin nhắn trong cuộc trò chuyện
  @Get(':id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  // Gửi tin nhắn
  @Post(':id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body()
    body: {
      senderId: number;
      content: string;
    },
  ) {
    return this.chatService.createMessage({
      conversationId,
      ...body,
    });
  }
}
