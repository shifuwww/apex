import { UserEntity } from '@app/common/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private _logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
  ) {}

  public getUserByEmail(email: string) {
    try {
      return this._userRepository.findOne({
        where: { email },
      });
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public getUserById(id: string) {
    try {
      return this._userRepository.findOne({
        where: { id },
      });
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public updateToken(id: string, token: string | null) {
    try {
      return this._userRepository.update({ id }, { token });
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public updatePassword(id: string, password: string) {
    try {
      return this._userRepository.update({ id }, { password });
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async createUser(email: string, password: string) {
    try {
      const entity = this._userRepository.create({email, password});
      return this._userRepository.save(entity);
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }
}
