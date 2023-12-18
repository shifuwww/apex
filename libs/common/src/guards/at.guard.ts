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
export class AtGuard implements CanActivate {
  constructor(@Inject('auth') private readonly _authService: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let authHeader: string;
    if (context.getType() === 'http') {
      authHeader = context.switchToHttp().getRequest().headers['authorization']
    } else if (context.getType() === 'rpc') {
      authHeader = context.switchToRpc().getData().headers.get('Authorization');
    }

    if (!authHeader) return false;

    const authHeaderParts = (authHeader as string).split(' ');

    if (authHeaderParts.length !== 2) return false;

    const [, jwt] = authHeaderParts;

    return this._authService.send({ cmd: 'validate-at-jwt' }, { jwt }).pipe(
      switchMap(({ exp, sub }) => {
        if (!exp) return of(false);
   
        return of(sub);
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
