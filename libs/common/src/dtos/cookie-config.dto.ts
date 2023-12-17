import { ApiProperty } from '@nestjs/swagger';

export class CookieConfigDto {
  @ApiProperty({
    type: Boolean,
    description: 'Only http',
  })
  httpOnly: boolean;

  @ApiProperty({
    type: Date,
    description: 'Date of expires',
  })
  expires: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Path to cookie',
  })
  path: string;
}
