import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListPackagesQuery } from './list-packages.query';
import { ListPackagesHandler } from './list-packages.handler';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';

@Controller('panels/packages')
@UseGuards(AuthGuard, RolesGuard)
export class ListPackagesController {
  constructor(private readonly handler: ListPackagesHandler) {}

  @Get('all')
  async execute(@CurrentUser() user: AuthenticatedUser): Promise<TestPackage[]> {
    return this.handler.execute(new ListPackagesQuery(user.labId));
  }
}
