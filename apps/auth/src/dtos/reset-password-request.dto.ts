import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  // @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
