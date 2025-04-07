import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class UpdateMasterDataDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: {
      dayExpired: 180,
      dayShowExpire: 7,
    },
    required: true,
    type: Object,
  })
  @IsObject()
  data: any;
}
