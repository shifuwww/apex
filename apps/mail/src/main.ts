import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common/modules';
import { MailModule } from './mail.module';

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('mail'));
  await app.startAllMicroservices();
}
bootstrap();
