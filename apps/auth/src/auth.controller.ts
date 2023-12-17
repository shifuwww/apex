import { Controller, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CookieConfigDto,
  CreateNewPasswordDto,
  EmailPayloadDto,
  ResetPasswordRequestDto,
  SignInDto,
  SignUpDto,
  SignUpRequestDto,
  TokensDto,
} from '@app/common/dtos';
import { AtGuard, RtGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-in' })
  public async signIn(
    @Payload() payload: { body: SignInDto; response: Response },
  ): Promise<TokensDto & CookieConfigDto> {
    const data = await this._authService.signIn(payload.body);
    const cookie = await this._authService.cookieConfig(data.refreshToken);
    return { ...data, ...cookie };
  }

  @MessagePattern({ cmd: 'logout' })
  public async logout(
    @Payload() payload: { id: string },
  ): Promise<CookieConfigDto> {
    await this._authService.logout(payload.id);
    const cookie = await this._authService.cookieConfig(null);
    return cookie;
  }

  @MessagePattern({ cmd: 'refresh' })
  public async refresh(
    @Payload() payload: { id: string; token: string },
  ): Promise<TokensDto & CookieConfigDto> {
    const data = await this._authService.refresh(payload.id, payload.token);
    const cookie = await this._authService.cookieConfig(data.refreshToken);
    return { ...data, ...cookie };
  }

  @MessagePattern({ cmd: 'sign-up' })
  public async signUp(
    @Payload() signUpDto: SignUpDto,
  ): Promise<TokensDto & CookieConfigDto> {
    const data = await this._authService.signUp(signUpDto);
    const cookie = await this._authService.cookieConfig(data.refreshToken);
    return { ...data, ...cookie };
  }

  @MessagePattern({ cmd: 'sign-up-request' })
  public signUpRequest(
    @Payload() signUpRequestDto: SignUpRequestDto,
  ): Promise<EmailPayloadDto> {
    return this._authService.signUpRequest(signUpRequestDto);
  }

  @MessagePattern({ cmd: 'create-new-password' })
  public async createNewPassword(
    @Payload() createNewPasswordDto: CreateNewPasswordDto,
  ): Promise<TokensDto & CookieConfigDto> {
    const data = await this._authService.createNewPassword(
      createNewPasswordDto,
    );
    const cookie = await this._authService.cookieConfig(data.refreshToken);
    return { ...data, ...cookie };
  }

  @MessagePattern({ cmd: 'reset-new-password' })
  public resetPassword(
    @Payload() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<EmailPayloadDto> {
    return this._authService.resetPassword(resetPasswordDto);
  }

  @MessagePattern({ cmd: 'validate-at-jwt' })
  public validateAtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ user: any; exp: any }> {
    return this._authService.validateAtJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'validate-rt-jwt' })
  public validateRtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ user: any; exp: any }> {
    return this._authService.validateRtJwt(payload.jwt);
  }
}
