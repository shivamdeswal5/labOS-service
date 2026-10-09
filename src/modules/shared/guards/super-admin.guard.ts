import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SuperAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      this.logger.warn('SuperAdminGuard rejected: No authenticated user session');
      throw new ForbiddenException('Super Admin privilege required: No authenticated user session');
    }

    const adminEmailsConfig = process.env.SUPER_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsConfig
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    const userEmail = user.email.toLowerCase();

    // In local development/testing without SUPER_ADMIN_EMAILS set, default to any authenticated user if configured or check allowlist
    const isAllowlisted = adminEmails.length > 0 && adminEmails.includes(userEmail);
    const isSuperAdminRole = user.profile?.role === 'SUPER_ADMIN';

    if (isAllowlisted || isSuperAdminRole) {
      return true;
    }

    this.logger.warn(`SuperAdminGuard rejected access attempt by: ${userEmail}`);
    throw new ForbiddenException('Super Admin privilege required to access this resource');
  }
}
