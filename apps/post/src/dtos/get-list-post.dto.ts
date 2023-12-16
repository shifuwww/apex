import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetListPostDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Number of page',
    example: 1,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }: { value: number }) =>
    value > 0 && value < 10000 ? value : 1,
  )
  page = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of elements on one page',
    example: 20,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }: { value: number }) =>
    value > 0 && value < 100 ? value : 20,
  )
  limit = 20;

  @ApiPropertyOptional({
    type: String,
    description: 'Type of sort (desc or asc)',
    example: 'desc',
  })
  @IsString()
  @Transform(({ value }) => (value === 'desc' ? 'DESC' : 'ASC'))
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    type: String,
    description: 'Field of sort',
    example: 'id',
  })
  @IsString()
  @IsOptional()
  orderField = 'id';

  public getOrderedField(fields: string[]) {
    return fields.includes(this.orderField) ? this.orderField : 'id';
  }

  public countOffset(): number {
    return (this.page - 1) * this.limit;
  }
}
