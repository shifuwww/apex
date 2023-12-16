import { Column } from 'typeorm';

export class TestEntity {
  @Column()
  res: string;
}
