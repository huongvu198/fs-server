import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VietQRService } from './vietqr.service';
import { GenerateQRDto } from '../dto/viet-qr.dto';

// @UseGuards(CmsGuard)
@ApiTags('Vietqr')
@Controller('vietqr')
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class VietQRController {
  constructor(private readonly vietQRService: VietQRService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateQR(@Body() dto: GenerateQRDto) {
    return await this.vietQRService.generateQR(dto);
  }
}
