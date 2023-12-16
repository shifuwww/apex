import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Length, IsNumberString, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    type: String,
    description: 'Secret code',
  })
  @Length(5, 7)
  @IsNumberString()
  @IsNotEmpty()
  code: string;
}
