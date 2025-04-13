import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { config } from 'src/config/app.config';
import { GenerateQRDto } from '../dto/viet-qr.dto';
const { clientId, apiKey } = config.vietQR;

@Injectable()
export class VietQRService {
  constructor(private httpService: HttpService) {}

  async generateQR(payload: GenerateQRDto) {
    const { accountNo, accountName, acqId, amount, addInfo } = payload;

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.vietqr.io/v2/generate',
        {
          bin: acqId, // hoặc acqId là bin
          accountNo,
          accountName,
          amount,
          addInfo,
          template: 'compact',
        },
        {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }
}
