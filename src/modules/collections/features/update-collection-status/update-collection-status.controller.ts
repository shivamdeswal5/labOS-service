import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { UpdateCollectionStatusHandler } from './update-collection-status.handler';
import { UpdateCollectionStatusCommand } from './update-collection-status.command';
import { UpdateCollectionStatusDto } from './update-collection-status.dto';

@Controller('collections')
@UseGuards(AuthGuard)
export class UpdateCollectionStatusController {
  constructor(private readonly handler: UpdateCollectionStatusHandler) {}

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionStatusDto,
  ) {
    return this.handler.execute(
      new UpdateCollectionStatusCommand(user.labId, id, dto),
    );
  }
}
