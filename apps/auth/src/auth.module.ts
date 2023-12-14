import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './configs';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    JwtModule.registerAsync(jwtConfig),
    ConfigModule.forRoot({
      envFilePath: './apps/auth/.env',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
