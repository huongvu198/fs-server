import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BankTransaction } from './interface/webhook.interface';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor() {}

  @Post()
  @ApiOperation({
    description: 'receive Transaction Banking',
    operationId: 'receiveTransactionBanking',
  })
  handleTransactionPayment(@Body() data: BankTransaction) {
    if (typeof data !== 'object') {
      Logger.log('Webhook banking return no data');
    }

    Logger.log('data', data);
    //TODO: something
  }
}
