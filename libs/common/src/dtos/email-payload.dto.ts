import { ApiProperty } from '@nestjs/swagger';

export class EmailPayloadDto {
  @ApiProperty({
    type: String,
    description: 'email of user',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'text of mail',
  })
  text: string;
}
