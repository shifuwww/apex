import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common/modules';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const sharedService = app.get(RmqService);
  app.connectMicroservice(sharedService.getOptions('auth'));
  app.startAllMicroservices();
}
bootstrap();
