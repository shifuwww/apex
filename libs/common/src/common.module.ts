import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig, redisConfig } from './configs';
import SMTP_CONFIG from './configs/smtp.config';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RmqModule, SmtpModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(ormConfig),
    RedisModule.forRootAsync(redisConfig),
    SmtpModule.forRootAsync(SMTP_CONFIG.asProvider()),
    RmqModule,
  ],
  providers: [],
  exports: [],
})
export class CommonModule {}
