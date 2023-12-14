import { DynamicModule, Global, Module } from '@nestjs/common';

import { SMTP_OPTIONS, SmtpAsyncOptions } from './smtp.interface';
import { SmtpService } from './smtp.service';

@Global()
@Module({})
export class SmtpModule {
  static forRootAsync(options: SmtpAsyncOptions): DynamicModule {
    return {
      module: SmtpModule,
      imports: options.imports,
      providers: [
        {
          provide: SMTP_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        SmtpService,
      ],
      exports: [SmtpService],
    };
  }
}
