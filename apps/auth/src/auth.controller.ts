import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  CreateNewPasswordDto,
  ResetPasswordRequestDto,
  SignInDto,
  SignUpDto,
  SignUpRequestDto,
  StatusDto,
  TokensDto,
} from './dtos';
import { RtGuard } from './guards';
import { AUTH_COOKIE_NAME } from './consts';
import { AccessTokenInterface } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'User sign in',
    type: TokensDto,
  })
  @ApiOperation({ summary: 'User sign in' })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensDto> {
    const data = await this._authService.signIn(signInDto);
    this._authService.setCookie(res, data.refreshToken);
    return data;
  }

  @ApiResponse({
    status: 200,
    description: 'user logout',
    type: StatusDto,
  })
  @ApiCookieAuth()
  @ApiOperation({ summary: 'user logout' })
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public logout(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StatusDto> {
    const user = request.user as AccessTokenInterface;
    this._authService.setCookie(response, null);
    return this._authService.logout(user.id);
  }

  @ApiResponse({
    status: 200,
    description: 'User tokens refresh',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Update tokens by refresh token' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @ApiCookieAuth()
  @Post('refresh')
  public async refresh(
    @Req() request: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensDto> {
    const token = request.cookies[AUTH_COOKIE_NAME];
    const user = request.user as AccessTokenInterface;
    const data = await this._authService.refresh(user.id, token);
    this._authService.setCookie(res, data.refreshToken);
    return data;
  }

  @ApiResponse({
    status: 201,
    description: 'User sign up',
    type: TokensDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Finished registration' })
  @Post(`sign-up`)
  public async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensDto> {
    const data = await this._authService.signUp(signUpDto);
    this._authService.setCookie(res, data.refreshToken);
    return data;
  }

  @ApiResponse({
    status: 200,
    description: 'Sign up request',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Send registration request' })
  @HttpCode(HttpStatus.OK)
  @Post('sign-up-request')
  public signUpRequest(
    @Body() signUpRequestDto: SignUpRequestDto,
  ): Promise<StatusDto> {
    return this._authService.signUpRequest(signUpRequestDto);
  }

  @ApiResponse({
    status: 200,
    description: 'User password updated',
    type: TokensDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User password update' })
  @Post(`create-new-password`)
  public async createNewPassword(
    @Body() createNewPasswordDto: CreateNewPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensDto> {
    const data = await this._authService.createNewPassword(
      createNewPasswordDto,
    );
    this._authService.setCookie(res, data.refreshToken);
    return data;
  }

  @ApiResponse({
    status: 200,
    description: 'Password reset request',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Send password reset request' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password-request')
  public resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<StatusDto> {
    return this._authService.resetPassword(resetPasswordDto);
  }
}
