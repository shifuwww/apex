import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

import { SMTP_OPTIONS, SmtpOptions } from './smtp.interface';

@Injectable()
export class SmtpService implements OnModuleInit {
  transport: Transporter;
  private _logger = new Logger(SmtpService.name);
  constructor(
    @Inject(SMTP_OPTIONS) private readonly smtpOptions: SmtpOptions,
  ) {}

  onModuleInit() {
    this.transport = createTransport({
      host: this.smtpOptions.host,
      port: this.smtpOptions.port,
      auth: {
        user: this.smtpOptions.auth.user,
        pass: this.smtpOptions.auth.pass,
      },
    });
  }

  async send(to: string, text: string) {
    console.log(to)
    try {
      await this.transport.sendMail({
        from: this.smtpOptions.from,
        html: `<h1>${text}</h1>`,
        text: `<h1>${text}</h1>`,
        to,
      });
    } catch(err) {
      this._logger.error(err);
      throw err;
    }
  }
}
