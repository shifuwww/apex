import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  @ApiProperty({
    example: 200,
    type: Number,
    description: 'Status of request',
  })
  status: number;
}
