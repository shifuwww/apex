import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mailer.controller';
import { MailService } from './mailer.service';
import { RmqModule } from '@app/common/modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/mailer/.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: +configService.get<string>('SMTP_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_APP_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    RmqModule,
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
