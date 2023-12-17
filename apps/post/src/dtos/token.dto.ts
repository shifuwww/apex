import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI1Yzc3MWQ2LTY5NWMtNGM0OC04NjFlLTE5NzRhOTAxMTM4ZiIsInN1YiI6IjI1Yzc3MWQ2LTY5NWMtNGM0OC04NjFlLTE5NzRhOTAxMTM4ZiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IlBsYXllcjEiLCJpYXQiOjE2OTcwMTg0OTcsImV4cCI6MTY5NzYyMzI5N30.F0PhDA3MoXq_-YSIGNMj54EszoNqusTXA-j0pVgqjbs',
    type: String,
    description: 'Access token',
  })
  accessToken: string;
}
