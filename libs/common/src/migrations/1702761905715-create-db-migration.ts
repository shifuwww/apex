import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { faker } from '@faker-js/faker';
import { PostEntity } from '../entities/post.entity';
import * as crypto from 'crypto';

export class CreateDbMigration1702761905715 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "user" (
            "id" uuid PRIMARY KEY,
            "email" varchar(255) NOT NULL,
            "token" varchar(255) NULL,
            "password" varchar(255) NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
    async function _hashPassword(target: string): Promise<string> {
        try {
          const salt = await _generateSalt();
          const hash = await _hashWithSalt(target, salt);
    
          return `${salt}:${hash}`;
        } catch (err) {
          this._logger.error(err);
          throw err;
        }
    }

    async function _generateSalt(): Promise<string> {
        return crypto.randomBytes(10).toString('hex');
      }
    
    async function _hashWithSalt(hash: string, salt: string): Promise<string> {
        const _hash = crypto.createHmac('sha256', salt);
        _hash.update(hash);
        return _hash.digest('hex');
      }

    const users: UserEntity[] = [
      Object.assign(new UserEntity(), {
        id: faker.string.uuid(),
        email: `user@gmail.com`,
        password: await _hashPassword('Qwerty123321!'),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      }),
    ];
    for (let i = 0; i < 10; i++) {
      users.push(
        Object.assign(new UserEntity(), {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          password: await _hashPassword(faker.internet.password()),
          createdAt: faker.date.past(),
          updatedAt: faker.date.past(),
        }),
      );
    }

    const userRepository = queryRunner.manager.getRepository(UserEntity);

    const newUsers = await userRepository.save(users);

    await queryRunner.query(`
        CREATE TABLE "post" (
            "id" uuid PRIMARY KEY,
            "title" varchar(255) NOT NULL,
            "text" text NOT NULL,
            "ownerId" uuid NOT NULL,
            CONSTRAINT "fk_owner" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const postRepository = queryRunner.manager.getRepository(PostEntity);
    const posts: PostEntity[] = [];

    newUsers.forEach((user) => {
      posts.push(
        ...faker.helpers.multiple(
          () =>
            Object.assign(new PostEntity(), {
              id: faker.string.uuid(),
              title: faker.lorem.words(3),
              text: faker.lorem.paragraph(),
              owner: { id: user.id },
              createdAt: faker.date.past(),
              updatedAt: faker.date.past(),
            }),
          { count: 5 },
        ),
      );
    });

    await postRepository.save(posts);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
