import { PostEntity } from '@app/common/entities';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePostDto,
  GetListPostDto,
  GetPostDto,
  ListPostDto,
  UpdatePostDto,
} from './dtos';

@Injectable()
export class PostService {
  private _logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly _postRepository: Repository<PostEntity>,
  ) {}

  public createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<GetPostDto> {
    try {
      return this._postRepository.save(
        Object.assign(new PostEntity(), {
          ...createPostDto,
          owner: { id: userId },
        }),
      );
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async updatePost(
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<GetPostDto> {
    const { id } = updatePostDto;
    try {
      const post = await this._postRepository.findOne({
        select: { id: true, title: true, text: true, owner: { id: true } },
        where: { id },
        relations: { owner: true },
      });

      if (!post) {
        throw new NotFoundException('Post does not exist!');
      }

      if (post.owner.id !== userId) {
        throw new ForbiddenException('Access denied!');
      }

      return this._postRepository.save(Object.assign(post, updatePostDto));
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async getListPost(
    getListPostDto: GetListPostDto,
  ): Promise<ListPostDto> {
    const { limit, order, page } = getListPostDto;
    try {
      const [data, total] = await this._postRepository.findAndCount({
        take: limit,
        skip: getListPostDto.countOffset(),
        order: {
          [`${getListPostDto.getOrderedField(Object.keys(PostEntity))}`]: order,
        },
      });

      return { data, total, page };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async getPost(id: string): Promise<GetPostDto> {
    try {
      const post = await this._postRepository.findOne({
        where: { id },
      });

      if (!post) {
        throw new NotFoundException('Post does not exist!');
      }

      return post;
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }

  public async getMyPost(
    getListPostDto: GetListPostDto,
    userId: string,
  ): Promise<ListPostDto> {
    const { limit, order, page } = getListPostDto;
    try {
      const [data, total] = await this._postRepository.findAndCount({
        where: { owner: { id: userId } },
        take: limit,
        skip: getListPostDto.countOffset(),
        order: {
          [`${getListPostDto.getOrderedField(Object.keys(PostEntity))}`]: order,
        },
      });

      return { data, total, page };
    } catch (err) {
      this._logger.error(err);
      throw err;
    }
  }
}
