import { ConfigModule, ConfigService } from '@nestjs/config';

export const jwtConfig = {
  imports: [ConfigModule.forRoot()],
  useFactory: (configService: ConfigService) => {
    return {
      global: true,
      secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: +configService.get('JWT_ACCESS_TOKEN_TTL') || 3600,
      },
      notBefore: 0,
    };
  },
  inject: [ConfigService],
};
