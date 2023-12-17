import { Controller, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateNewPasswordDto,
  ResetPasswordRequestDto,
  SignInDto,
  SignUpDto,
  SignUpRequestDto,
  StatusDto,
  TokensDto,
} from '@app/common/dtos';
import { AtGuard, RtGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-in' })
  public async signIn(
    @Payload() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokensDto> {
    return this._authService.signIn(signInDto);
  }

  @MessagePattern({ cmd: 'logout' })
  public async logout(
    @Payload() payload: { id: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    this._authService.setCookie(response, null);
    await this._authService.logout(payload.id);
    response.send();
  }

  @MessagePattern({ cmd: 'refresh' })
  public async refresh(
    @Payload() payload: { id: string; token: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const data = await this._authService.refresh(payload.id, payload.token);
    this._authService.setCookie(response, data.refreshToken);
    response.send(data);
  }

  @MessagePattern({ cmd: 'sign-up' })
  public async signUp(
    @Payload() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const data = await this._authService.signUp(signUpDto);
    this._authService.setCookie(response, data.refreshToken);
    response.send(data);
  }

  @MessagePattern({ cmd: 'sign-in-request' })
  public signUpRequest(
    @Payload() signUpRequestDto: SignUpRequestDto,
  ): Promise<StatusDto> {
    return this._authService.signUpRequest(signUpRequestDto);
  }

  @MessagePattern({ cmd: 'create-new-password' })
  public async createNewPassword(
    @Payload() createNewPasswordDto: CreateNewPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const data = await this._authService.createNewPassword(
      createNewPasswordDto,
    );
    this._authService.setCookie(response, data.refreshToken);
    response.send(data);
  }

  @MessagePattern({ cmd: 'reset-new-password' })
  public resetPassword(
    @Payload() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<StatusDto> {
    return this._authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AtGuard)
  @MessagePattern({ cmd: 'validate-at-jwt' })
  public validateAtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ user: any; exp: any }> {
    return this._authService.validateAtJwt(payload.jwt);
  }

  @UseGuards(RtGuard)
  @MessagePattern({ cmd: 'validate-rt-jwt' })
  public validateRtJwt(
    @Payload() payload: { jwt: string },
  ): Promise<{ user: any; exp: any }> {
    return this._authService.validateRtJwt(payload.jwt);
  }
}
