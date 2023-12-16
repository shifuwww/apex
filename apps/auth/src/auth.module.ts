import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './configs';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RmqModule, SmtpModule } from '@app/common/modules';
import { ormConfig, redisConfig } from '@app/common/configs';
import SMTP_CONFIG from '@app/common/configs/smtp.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
    }),
    TypeOrmModule.forRootAsync(ormConfig),
    RedisModule.forRootAsync(redisConfig),
    SmtpModule.forRootAsync(SMTP_CONFIG.asProvider()),
    RmqModule,
    UserModule,
    JwtModule.registerAsync(jwtConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
