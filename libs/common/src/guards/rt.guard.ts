import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, of, switchMap } from 'rxjs';

@Injectable()
export class RtGuard implements CanActivate {
  constructor(@Inject('auth') private readonly _authService: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return false;
    }

    const request = context.switchToHttp().getRequest();

    const authCookies = await request.cookies['auth'];

    if (!authCookies) return false;

    return firstValueFrom(
      this._authService
        .send({ cmd: 'validate-rt-jwt' }, { jwt: authCookies })
        .pipe(
          switchMap(({ exp }) => {
            if (!exp) return of(false);

            const TOKEN_EXP_MS = exp * 1000;
            console.log(TOKEN_EXP_MS, Date.now());
            const isJwtValid = Date.now() < TOKEN_EXP_MS;
            console.log(exp);
            return of(isJwtValid);
          }),
          catchError(() => {
            throw new UnauthorizedException();
          }),
        ),
    );
  }
}
