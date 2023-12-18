import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './configs';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ormConfig, redisConfig } from '@app/common/configs';
import { RtStrategy } from './strategies/refresh-token.strategy';
import { AtStrategy } from './strategies';
import { RmqModule } from '@app/common/modules';
import { AtGuard, RtGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
    }),
    TypeOrmModule.forRootAsync(ormConfig),
    RedisModule.forRootAsync(redisConfig),
    UserModule,
    JwtModule.registerAsync(jwtConfig),
    RmqModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RtStrategy, AtStrategy, RtGuard, AtGuard],
})
export class AuthModule {}
