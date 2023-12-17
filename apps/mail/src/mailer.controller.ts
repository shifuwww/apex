import { Controller } from '@nestjs/common';
import { MailService } from './mailer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MailController {
  constructor(private readonly _mailService: MailService) {}

  @MessagePattern({ cmd: 'send' })
  public async createNewPassword(
    @Payload() { email, text }: { email: string; text: string },
  ) {
    return this._mailService.send(email, text);
  }
}
