import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsStrongPassword, Length } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  // @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Qwerty123321!',
    type: String,
    description: 'Password of user',
  })
  @Length(8, 20)
  @IsStrongPassword()
  password: string;
}
