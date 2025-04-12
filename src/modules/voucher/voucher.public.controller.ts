import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VouchersService } from './voucher.service';

@ApiTags('Vouchers-Public')
@Controller({
  path: 'vouchers-public',
  version: '1',
})
export class VouchersPublicController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('available/:userId')
  @HttpCode(HttpStatus.OK)
  async getVoucherByUserId(@Param('userId') userId: string) {
    return await this.vouchersService.getListVoucherValidByUserId(
      Number(userId),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getVoucherByCode(
    @Query('userId') userId: string,
    @Query('code') code: string,
  ) {
    return await this.vouchersService.getVoucherByCode(Number(userId), code);
  }
}
