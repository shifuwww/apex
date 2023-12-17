import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '@app/common/configs';
import { RmqModule } from '@app/common/modules';
import { ConfigModule } from '@nestjs/config';
import { PostEntity } from '@app/common/entities';
import { AUTH_SERVICE, MAIL_SERVICE } from './consts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/post/.env',
    }),
    TypeOrmModule.forRootAsync(ormConfig),
    TypeOrmModule.forFeature([PostEntity]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: MAIL_SERVICE,
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
