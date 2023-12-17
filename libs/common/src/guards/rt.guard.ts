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

    const authCookies = await request.cookies?.auth;
    if (!authCookies) return false;
    return firstValueFrom(
      this._authService
        .send({ cmd: 'validate-rt-jwt' }, { jwt: authCookies, request })
        .pipe(
          switchMap(({ exp }) => {
            console.log(exp)
            if (!exp) return of(false);
            const TOKEN_EXP_MS = exp * 1000;
            const isJwtValid = Date.now() < TOKEN_EXP_MS;


            return of(isJwtValid ? context.switchToHttp().getRequest().user : false);
          }),
          catchError(() => {
            throw new UnauthorizedException();
          }),
        ),
    );
  }
}
