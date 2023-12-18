import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user/user.service';
import {
  CookieConfigDto,
  CreateNewPasswordDto,
  EmailPayloadDto,
  ResetPasswordRequestDto,
  SignInDto,
  SignUpDto,
  SignUpRequestDto,
  StatusDto,
  TokensDto,
} from '../../../libs/common/src/dtos';
import { JwtService } from '@nestjs/jwt';
import { RESEND_TTL_SECONDS, SIGN_UP_TTL_SECONDS } from './consts';
import * as crypto from 'crypto';
import { AccessTokenInterface } from './interfaces';
import { generateCode, generateToken } from './utils';
import { UserEntity } from '@app/common/entities';

@Injectable()
export class AuthService {
  private _logger = new Logger(AuthService.name);

  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserService,
    private readonly _jwtService: JwtService,
    @InjectRedis() private readonly _redisRepository: Redis,
  ) {}

  public async validateRtJwt(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { sub, exp } = await this._jwtService.verifyAsync(token, {
        secret: this._configService.get('JWT_REFRESH_TOKEN_SECRET'),
        ignoreExpiration: false,
      });
      return { sub, exp };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async validateAtJwt(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { sub, exp } = await this._jwtService.verifyAsync(token, {
        secret: this._configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });

      return { sub, exp };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async signIn(signInDto: SignInDto): Promise<TokensDto> {
    const { email, password } = signInDto;
    try {
      const user = await this._userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email: ${email} does not exist`);
      }
      const isPasswordMatches = await this._compare(password, user.password);

      if (!isPasswordMatches) {
        throw new UnauthorizedException('Password or email is incorrect');
      }

      const tokens = await this._getTokens(user.id, user.email);
      await this._userService.updateToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async logout(token: string): Promise<StatusDto> {
    try {
      const user: AccessTokenInterface = await this._jwtService.decode(token);
      await this._userService.updateToken(user.id, null);
      return { status: HttpStatus.OK };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async refresh(
    refreshToken: string,
  ): Promise<TokensDto> {
    try {
      const userJwt = await this._jwtService.decode(refreshToken);
      const user = await this._userService.getUserById(userJwt.id);
      if (!user || !user.token) {
        throw new ForbiddenException('Access denied!', 'test');
      }

      if (user.token !== refreshToken) {
        throw new ForbiddenException('Access Denied');
      }

      const tokens = await this._getTokens(user.id, user.email);
      await this._userService.updateToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async signUp(signUpDto: SignUpDto): Promise<TokensDto> {
    const { email } = signUpDto;
    try {
      if (await this._userService.getUserByEmail(email)) {
        throw new ConflictException(`User with email:${email} already exists`);
      }
      const request = await this._redisRepository.get(email);

      if (!request) {
        throw new NotFoundException(
          'Your sign up request is not valid anymore',
        );
      }
      const requestFromBuffer = JSON.parse(request);

      if (requestFromBuffer.code !== signUpDto.code) {
        throw new ConflictException('Code is not valid!');
      }

      const password = await this._hashPassword(requestFromBuffer.password);

      const user = await this._userService.createUser(email, password);
      const tokens = await this._getTokens(user.id, user.email);

      await this._userService.updateToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async signUpRequest(
    signUpRequestDto: SignUpRequestDto,
  ): Promise<EmailPayloadDto> {
    const { email, password } = signUpRequestDto;
    try {
      if (await this._userService.getUserByEmail(email)) {
        throw new ConflictException(`User with email:${email} already exists`);
      }

      const request = await this._redisRepository.get(email);

      if (!request) {
        const code = generateCode();

        await this._redisRepository.set(
          email,
          Buffer.from(
            JSON.stringify({
              code,
              password,
              timeToSend: Date.now(),
            }),
          ),
          'EX',
          SIGN_UP_TTL_SECONDS,
        );

        return { email, text: `Code to activate account: ${code}` };
      }
      const requestFromBuffer = JSON.parse(request);
      const timeDifference = Math.floor(
        (Date.now() - requestFromBuffer.timeToSend) / 1000,
      );

      if (timeDifference < 60) {
        throw new ConflictException(
          `You can resend message after ${
            60 - timeDifference
          }s`,
        );
      }
      const code = generateCode();

      await this._redisRepository.set(
        email,
        Buffer.from(
          JSON.stringify({
            code,
            password,
            timeToSend: Date.now(),
          }),
        ),
        'EX',
        SIGN_UP_TTL_SECONDS,
      );

      return { email, text: `Code to activate account: ${code}` };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async createNewPassword(
    createNewPasswordDto: CreateNewPasswordDto,
  ): Promise<TokensDto> {
    const { email, password, token } = createNewPasswordDto;
    try {
      const user = await this._userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email: ${email} does not exist`);
      }

      const request = await this._redisRepository.get(user.id);

      if (!request) {
        throw new NotFoundException(
          'Your password reset request is not valid anymore',
        );
      }

      const requestFromBuffer = JSON.parse(request);

      if (requestFromBuffer.secret !== token) {
        throw new ConflictException('Token is not valid');
      }

      const newPassword = await this._hashPassword(password);
      await this._userService.updatePassword(user.id, newPassword);
      await this._redisRepository.del(user.id);

      const tokens = await this._getTokens(user.id, user.email);

      return tokens;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async resetPassword(
    resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<EmailPayloadDto> {
    const { email } = resetPasswordDto;
    try {
      const user = await this._userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email: ${email} does not exist`);
      }

      const secret = generateToken();

      const request = await this._redisRepository.get(user.id);

      if (!request) {
        await this._redisRepository.set(
          user.id,
          Buffer.from(
            JSON.stringify({
              secret,
              timeToSend: Date.now(),
            }),
          ),
          'EX',
          RESEND_TTL_SECONDS,
        );

        return {
          email,
          text: `Link to reset password: ${
            this._configService.get('CLIENT_URL') + '/reset-password/' + secret
          }`,
        };
      }
      const requestFromBuffer = JSON.parse(request);
      const timeDifference = Math.floor(
        (Date.now() - requestFromBuffer.timeToSend) / 1000,
      );

      if (timeDifference < 60) {
        throw new ConflictException(
          `You can resend message after ${
            60 - timeDifference
          }s`,
        );
      }

      await this._redisRepository.set(
        email,
        Buffer.from(
          JSON.stringify({
            secret,
            timeToSend: Date.now(),
          }),
        ),
        'EX',
        RESEND_TTL_SECONDS,
      );

      return {
        email,
        text: `Link to reset password: ${
          this._configService.get('CLIENT_URL') + '/reset-password/' + secret
        }`,
      };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async cookieConfig(
    refreshToken: string | null,
  ): Promise<CookieConfigDto> {
    return {
      httpOnly: true,
      expires: refreshToken
        ? new Date(
            Date.now() +
              +this._configService.get('JWT_REFRESH_TOKEN_TTL') * 1000,
          )
        : new Date(Date.now() - 1000),
      path: '/',
    };
  }

  private async _hashPassword(target: string): Promise<string> {
    try {
      const salt = await this._generateSalt();
      const hash = await this._hashWithSalt(target, salt);

      return `${salt}:${hash}`;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  private async _compare(target: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(':');

    const hashOfInput = await this._hashWithSalt(target, salt);

    return hashOfInput === storedHash;
  }

  private async _generateSalt(): Promise<string> {
    return crypto.randomBytes(10).toString('hex');
  }

  private async _hashWithSalt(hash: string, salt: string): Promise<string> {
    const _hash = crypto.createHmac('sha256', salt);
    _hash.update(hash);
    return _hash.digest('hex');
  }

  private async _getTokens(userId: string, email: string): Promise<TokensDto> {
    const jwtPayload: AccessTokenInterface = {
      sub: userId,
      email: email,
    };
    const [at, rt] = await Promise.all([
      await this._jwtService.signAsync(jwtPayload, {
        secret: this._configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this._configService.get<string>(
          'JWT_ACCESS_TOKEN_TTL',
        )}s`,
      }),
      await this._jwtService.signAsync(jwtPayload, {
        secret: this._configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this._configService.get<string>(
          'JWT_REFRESH_TOKEN_TTL',
        )}s`,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
