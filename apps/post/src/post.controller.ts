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
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, GetListPostDto, GetPostDto, ListPostDto, UpdatePostDto } from './dtos';
import { AuthGuard, RtGuard } from '@app/common/guards';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from './consts';
import {
  TokensDto,
  SignInDto,
  StatusDto,
  SignUpDto,
  SignUpRequestDto,
  CreateNewPasswordDto,
  ResetPasswordRequestDto,
} from '@app/common/dtos';
import { AccessTokenInterface } from 'apps/auth/src/interfaces';
import { Observable } from 'rxjs';

@Controller()
export class PostController {
  constructor(
    private readonly _postService: PostService,
    @Inject(AUTH_SERVICE) private readonly _authClient: ClientProxy,
  ) {}

  @ApiTags('post')
  @ApiResponse({
    status: 201,
    description: 'Get list of posts',
    type: ListPostDto,
  })
  @ApiOperation({ summary: 'Get lists of posts' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('post/list')
  public getListPost(@Query() getListPostDto: GetListPostDto): Promise<ListPostDto> {
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('post/my')
  public getMyPosts(@Query() getListPostDto: GetListPostDto, @Req() request: any): Promise<ListPostDto> {
    const user = request.user as AccessTokenInterface;
    return this._postService.getMyPost(getListPostDto, user.id);
  }

  @ApiTags('post')
  @ApiResponse({
    status: 201,
    description: 'Create post',
    type: GetPostDto,
  })
  @ApiOperation({ summary: 'Create post' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('post')
  public createPost(@Body() createPostDto: CreatePostDto, @Req() request: any): Promise<GetPostDto> {
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('post')
  public updatePost(@Body() updatePostDto: UpdatePostDto, @Req() request: any): Promise<GetPostDto> {
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('post/:id')
  public deletePost(@Param('id', ParseUUIDPipe) id: string, @Req() request: any): Promise<StatusDto> {
    const user = request.user as AccessTokenInterface;
    return this._postService.deletePost(id, user.id);
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User sign in',
    type: TokensDto,
  })
  @ApiOperation({ summary: 'User sign in' })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  public signIn(@Body() signInDto: SignInDto): Observable<TokensDto> {
    return this._authClient.send({ cmd: 'sign-in' }, signInDto);
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
  public logout(@Req() request: any): Observable<TokensDto> {
    const user = request.user as AccessTokenInterface;
    return this._authClient.send({ cmd: 'logout' }, { id: user.id });
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User tokens refresh',
    type: StatusDto,
  })
  @ApiOperation({ summary: 'Update tokens by refresh token' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @ApiCookieAuth()
  @Post('auth/refresh')
  public refresh(@Req() request: any): Observable<TokensDto> {
    const user = request.user as AccessTokenInterface;
    const token = request.cookies['auth'];
    return this._authClient.send({ cmd: 'refresh' }, { id: user.id, token });
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 201,
    description: 'User sign up',
    type: TokensDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Finished registration' })
  @Post('auth/sign-up')
  public signUp(@Body() signUpDto: SignUpDto): Observable<TokensDto> {
    return this._authClient.send({ cmd: 'sign-up' }, signUpDto);
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
  public signUpRequest(@Body() signUpRequestDto: SignUpRequestDto): Observable<TokensDto> {
    return this._authClient.send({ cmd: 'sign-up-request' }, signUpRequestDto);
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'User password updated',
    type: TokensDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User password update' })
  @Post(`create-new-password`)
  public createNewPassword(
    @Body() createNewPasswordDto: CreateNewPasswordDto,
  ): Observable<TokensDto> {
    return this._authClient.send(
      { cmd: 'create-new-password' },
      createNewPasswordDto,
    );
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
  public resetPassword(@Body() resetPasswordDto: ResetPasswordRequestDto): Observable<TokensDto> {
    return this._authClient.send(
      { cmd: 'reset-password-request' },
      resetPasswordDto,
    );
  }
}
