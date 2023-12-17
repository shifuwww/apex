import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mailer.controller';
import { MailService } from './mailer.service';

describe('MailController', () => {
  let mailController: MailController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [MailService],
    }).compile();

    mailController = app.get<MailController>(MailController);
  });
});
