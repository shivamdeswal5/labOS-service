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
import { CancelCollectionHandler } from './cancel-collection.handler';
import { CancelCollectionCommand } from './cancel-collection.command';
import { CancelCollectionDto } from './cancel-collection.dto';

@Controller('collections')
@UseGuards(AuthGuard)
export class CancelCollectionController {
  constructor(private readonly handler: CancelCollectionHandler) {}

  @Patch(':id/cancel')
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelCollectionDto,
  ) {
    return this.handler.execute(
      new CancelCollectionCommand(user.labId, id, dto),
    );
  }
}
