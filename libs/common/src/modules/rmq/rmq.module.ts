import { Module } from '@nestjs/common';

import { RmqService } from './rmq.service';
import { RmqConfig } from '@app/common/configs';

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule extends RmqConfig {}
