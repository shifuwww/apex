import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsStrongPassword, Length } from 'class-validator';

export class CreateNewPasswordDto {
  @ApiProperty({
    example: 'user@gmail.com',
    type: String,
    description: 'Email of user',
  })
  // @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    example: 'Qwerty123321!',
    type: String,
    description: 'Password of user',
  })
  @IsStrongPassword()
  @Length(8, 20)
  password: string;

  @ApiProperty({
    example: 'zmcEVKZu1JAyF8o1TAF2PjNPfFGSkbT0',
    type: String,
    description: 'Secret token',
  })
  @IsString()
  @Length(31, 33)
  token: string;
}
function IsEmail(): (
  target: CreateNewPasswordDto,
  propertyKey: 'email',
) => void {
  throw new Error('Function not implemented.');
}
