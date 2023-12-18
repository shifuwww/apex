import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private _logger = new Logger(MailService.name);

  constructor(
    private readonly _mailService: MailerService,
    private readonly _configService: ConfigService,
  ) {}

  async send(to: string, text: string) {
    try {
      await this._mailService.sendMail({
        from: this._configService.get<string>('SMTP_USER'),
        html: `<h1>${text}</h1>`,
        text: `<h1>${text}</h1>`,
        to,
      });

      return { status: HttpStatus.OK };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }
}
