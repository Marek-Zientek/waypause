import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;

    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.slice(7);
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.getUser(token);

    if (error || !user) throw new UnauthorizedException();

    (req as Request & { user: { sub: string; email: string } }).user = {
      sub: user.id,
      email: user.email ?? '',
    };

    return true;
  }
}
