import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { RolesGuard } from 'src/modules/shared/guards/roles.guard';
import { Roles } from 'src/modules/shared/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { CreatePackageDto } from './create-package.dto';
import { CreatePackageCommand } from './create-package.command';
import { CreatePackageHandler } from './create-package.handler';
import { TestPackage } from 'src/modules/panels/domain/package/test-package.entity';

@Controller('panels/packages')
@UseGuards(AuthGuard, RolesGuard)
export class CreatePackageController {
  constructor(private readonly handler: CreatePackageHandler) {}

  @Post()
  @Roles(RoleEnum.OWNER)
  async execute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePackageDto,
  ): Promise<TestPackage> {
    return this.handler.execute(new CreatePackageCommand(user.labId, dto));
  }
}
