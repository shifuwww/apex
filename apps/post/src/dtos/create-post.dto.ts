import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Autumn`s Arrival',
    type: String,
    description: 'Title of post',
  })
  @IsString()
  @Length(4, 30)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'As summer bids its warm farewell, a subtle transformation begins to unfold, painting the world in hues of amber and russet. The brisk breeze whispers through the trees, coaxing leaves to dance their graceful descent to the ground.',
    type: String,
    description: 'Content of post',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
