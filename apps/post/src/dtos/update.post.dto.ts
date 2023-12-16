import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    example: 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
    type: String,
    description: 'Id of post',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    example: 'Autumn`s Arrival',
    type: String,
    description: 'Title of post',
  })
  @IsString()
  @Length(4, 30)
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    example:
      'As summer bids its warm farewell, a subtle transformation begins to unfold, painting the world in hues of amber and russet. The brisk breeze whispers through the trees, coaxing leaves to dance their graceful descent to the ground.',
    type: String,
    description: 'Content of post',
  })
  @IsString()
  @IsOptional()
  text: string;
}
