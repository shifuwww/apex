import { ApiProperty } from '@nestjs/swagger';

export class GetPostDto {
  @ApiProperty({
    example: 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
    type: String,
    description: 'Id of post',
  })
  id: string;

  @ApiProperty({
    example: 'Autumn`s Arrival',
    type: String,
    description: 'Title of post',
  })
  title: string;

  @ApiProperty({
    example:
      'As summer bids its warm farewell, a subtle transformation begins to unfold, painting the world in hues of amber and russet. The brisk breeze whispers through the trees, coaxing leaves to dance their graceful descent to the ground.',
    type: String,
    description: 'Content of post',
  })
  text: string;

  @ApiProperty({
    example: '2023-12-04 13:33:15.774775+06',
    type: Date,
    description: 'Created date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-12-04 13:33:15.774775+06',
    type: Date,
    description: 'Last updated date',
  })
  updatedAt: Date;
}
