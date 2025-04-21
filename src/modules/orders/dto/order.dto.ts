import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethodEnum } from '../../../utils/enum';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  addressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voucherId: string;

  @ApiProperty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;
}
