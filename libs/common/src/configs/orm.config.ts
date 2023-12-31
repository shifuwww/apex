import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { dataSourceOptions } from './typeorm.config';

export const ormConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    return {
      ...dataSourceOptions,
      synchronize: false,
      logging: true,
    };
  },
};
