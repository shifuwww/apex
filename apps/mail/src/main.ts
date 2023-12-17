import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common/modules';
import { MailModule } from './mail.module';

async function bootstrap() {
  const app = await NestFactory.create(MailModule);

  const sharedService = app.get(RmqService);
  app.connectMicroservice(sharedService.getOptions('mail'));
  app.startAllMicroservices();
}
bootstrap();
