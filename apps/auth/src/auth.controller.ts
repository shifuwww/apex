import { Controller, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
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
import { RmqService } from '@app/common/modules';
import { AccessTokenInterface } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService, private readonly _rmqService: RmqService) {}

  @MessagePattern({ cmd: 'sign-in' })
  public async signIn(
    @Payload() signInDto: SignInDto,
  ): Promise<TokensDto & CookieConfigDto> {
    const data = await this._authService.signIn(signInDto);
    const cookie = await this._authService.cookieConfig(data.refreshToken);
    return { ...data, ...cookie };
  }

  @EventPattern('logout')
  public async logout(
    @Payload() payload: { token: string },
    @Ctx() context: RmqContext
  ): Promise<void> {
    await this._authService.logout(payload.token);
    this._rmqService.ack(context);
  }
  
  @MessagePattern({ cmd: 'refresh' })
  @UseGuards(RtGuard)
  public async updateTokens(
    @Payload() payload: { jwt: string },
    @Ctx() context: RmqContext,
    @Req() req: any,
  ): Promise<TokensDto & CookieConfigDto> {
    this._rmqService.ack(context);
    const user = req.user as AccessTokenInterface;
    const data = await this._authService.refresh(payload.jwt);
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
  @UseGuards(AtGuard)
  public validateAtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ sub: string; exp: number }> {
    return this._authService.validateAtJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'validate-rt-jwt' })
  @UseGuards(RtGuard)
  public validateRtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ sub: string; exp: number }> {
    return this._authService.validateRtJwt(payload.jwt);
  }
}
