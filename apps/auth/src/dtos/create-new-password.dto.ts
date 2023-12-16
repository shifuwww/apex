import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CreateNewPasswordDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
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

  @ApiProperty({
    example: 'zmcEVKZu1JAyF8o1TAF2PjNPfFGSkbT0',
    type: String,
    description: 'Secret token',
  })
  @IsString()
  @Length(31, 33)
  @IsNotEmpty()
  token: string;
}
