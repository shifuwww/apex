import { ApiProperty } from '@nestjs/swagger';
import { GetPostDto } from './get-post.dto';

export class ListPostDto {
  @ApiProperty({
    type: GetPostDto,
    isArray: true,
    description: 'data of list',
  })
  data: GetPostDto[];

  @ApiProperty({
    type: Number,
    description: 'total elements',
  })
  total: number;

  @ApiProperty({
    type: Number,
    description: 'Current page',
  })
  page: number;
}
