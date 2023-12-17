import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Qwerty123321!',
    type: String,
    description: 'Password of user',
  })
  @IsStrongPassword()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;
}
