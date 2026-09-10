import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { DeleteDoctorHandler } from './delete-doctor.handler';
import { DeleteDoctorCommand } from './delete-doctor.command';

@Controller('referrals/doctors')
@UseGuards(AuthGuard)
export class DeleteDoctorController {
  constructor(private readonly handler: DeleteDoctorHandler) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.handler.execute(new DeleteDoctorCommand(id, user.labId));
  }
}
