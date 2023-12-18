import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class RtGuard implements CanActivate {
  constructor(@Inject('auth') private readonly _authService: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let authCookie: string;


    if (context.getType() === 'http') {
      authCookie = context.switchToHttp().getRequest().cookies.auth;
    } else if(context.getType() === 'rpc') {
      authCookie = context.switchToRpc().getData().auth;
    }

    if (!authCookie) return false;
    return this._authService.send({ cmd: 'validate-rt-jwt' }, { jwt: authCookie }).pipe(
      switchMap(({ exp, sub }) => {
        if (!exp) return of(false);
        return of(sub) 
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
