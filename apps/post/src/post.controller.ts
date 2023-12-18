import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  CreatePostDto,
  GetListPostDto,
  GetPostDto,
  ListPostDto,
  TokenDto,
  UpdatePostDto,
} from './dtos';
import { AtGuard, RtGuard } from '@app/common/guards';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, COOKIE_AUTH, MAIL_SERVICE } from './consts';
import {
  TokensDto,
  SignInDto,
  StatusDto,
  SignUpDto,
  SignUpRequestDto,
  CreateNewPasswordDto,
  ResetPasswordRequestDto,
  EmailPayloadDto,
  CookieConfigDto,
} from '@app/common/dtos';
import { AccessTokenInterface } from 'apps/auth/src/interfaces';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

@Controller()
export class PostController {
  constructor(
    private readonly _postService: PostService,
    @Inject(AUTH_SERVICE) private readonly _authClient: ClientProxy,
    @Inject(MAIL_SERVICE) private readonly _mailService: ClientProxy,
  ) {}

  @ApiTags('post')
  @ApiResponse({
    status: 201,
    description: 'Get list of posts',
    type: ListPostDto,
  })
  @ApiOperation({ summary: 'Get lists of posts' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Get('post/list')
  public getListPost(
    @Query() getListPostDto: GetListPostDto,
  ): Promise<ListPostDto> {
    return this._postService.getListPost(getListPostDto);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 200,
    description: 'Get list of my posts',
    type: ListPostDto,
  })
  @ApiOperation({ summary: 'Get list of my posts' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Get('post/my')
  public getMyPosts(
    @Query() getListPostDto: GetListPostDto,
    @Req() request: any,
  ): Promise<ListPostDto> {
    const userId = request.sub;
    return this._postService.getMyPost(getListPostDto, userId);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 201,
    description: 'Create post',
    type: GetPostDto,
  })
  @ApiOperation({ summary: 'Create post' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Post('post')
  public createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() request: any,
  ): Promise<GetPostDto> {
    const user = request.user as AccessTokenInterface;
    return this._postService.createPost(createPostDto, user.id);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 200,
    description: 'Update post',
    type: GetPostDto,
  })
  @ApiOperation({ summary: 'Update post' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Put('post')
  public updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Req() request: any,
  ): Promise<GetPostDto> {
    const user = request.user as AccessTokenInterface;
    return this._postService.updatePost(updatePostDto, user.id);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 200,
    description: 'Get post by id',
    type: GetPostDto,
  })
  @ApiOperation({ summary: 'Get post by id' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Get('post/:id')
  public getPost(@Param('id', ParseUUIDPipe) id: string): Promise<GetPostDto> {
    return this._postService.getPost(id);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 204,
    description: 'Delete post by id',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Delete post by id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Delete('post/:id')
  public deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
  ): Promise<StatusDto> {
    const user = request.user as AccessTokenInterface;
    return this._postService.deletePost(id, user.id);
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User sign in',
    type: TokenDto,
  })
  @ApiOperation({ summary: 'User sign in' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/sign-in')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenDto> {
    const data: TokensDto & CookieConfigDto = await firstValueFrom(
      this._authClient.send({ cmd: 'sign-in' }, signInDto),
    );
    const { refreshToken, httpOnly, expires, path } = data;
    response.cookie(COOKIE_AUTH, refreshToken, {
      httpOnly,
      expires: new Date(expires),
      path,
    });

    return { accessToken: data.accessToken };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'user logout',
    type: StatusDto,
  })
  @ApiCookieAuth()
  @ApiOperation({ summary: 'user logout' })
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('auth/logout')
  public async logout(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StatusDto> {
    const token = request.cookies.auth;
    await firstValueFrom(
      this._authClient.emit('logout', { token }),
    );
    response.cookie(COOKIE_AUTH, null, {
      httpOnly: true,
      expires: new Date(),
      path: '/'
    });
    return { status: HttpStatus.OK };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User tokens refresh',
    type: TokenDto,
  })
  @ApiOperation({ summary: 'Update tokens by refresh token' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @ApiCookieAuth()
  @Post('auth/refresh')
  public async refresh(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenDto> {
    const userId: string = request.sub;
    const token: string = request.cookies.auth;
    const data: TokensDto & CookieConfigDto = await firstValueFrom(
      this._authClient.send({ cmd: 'refresh' }, { id: userId, token }));
    const { refreshToken, httpOnly, expires, path } = data;
    response.cookie(COOKIE_AUTH, refreshToken, {
      httpOnly,
      expires: new Date(expires),
      path,
    });

    return { accessToken: data.accessToken };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 201,
    description: 'User sign up',
    type: TokenDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Finished registration' })
  @Post('auth/sign-up')
  public async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenDto> {
    const data: TokensDto & CookieConfigDto = await firstValueFrom(
      this._authClient.send({ cmd: 'sign-up' }, signUpDto),
    );
    const { refreshToken, httpOnly, expires, path } = data;
    response.cookie(COOKIE_AUTH, refreshToken, {
      httpOnly,
      expires: new Date(expires),
      path,
    });

    return { accessToken: data.accessToken };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'Sign up request',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Send registration request' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/sign-up-request')
  public async signUpRequest(
    @Body() signUpRequestDto: SignUpRequestDto,
  ): Promise<StatusDto> {
    const payload: EmailPayloadDto = await firstValueFrom(
      this._authClient.send({ cmd: 'sign-up-request' }, signUpRequestDto),
    );
    return firstValueFrom(this._mailService.send({ cmd: 'send' }, payload));
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User password updated',
    type: TokenDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User password update' })
  @Post(`create-new-password`)
  public async createNewPassword(
    @Body() createNewPasswordDto: CreateNewPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenDto> {
    const data: TokensDto & CookieConfigDto = await firstValueFrom(
      this._authClient.send(
        { cmd: 'create-new-password' },
        createNewPasswordDto,
      ),
    );

    const { refreshToken, httpOnly, expires, path } = data;
    response.cookie(COOKIE_AUTH, refreshToken, {
      httpOnly,
      expires: new Date(expires),
      path,
    });

    return { accessToken: data.accessToken };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'Password reset request',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Send password reset request' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/reset-password-request')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<StatusDto> {
    const payload: EmailPayloadDto = await firstValueFrom(
      this._authClient.send(
        { cmd: 'reset-password-request' },
        resetPasswordDto,
      ),
    );
    return firstValueFrom(this._mailService.send({ cmd: 'send' }, payload));
  }
}
