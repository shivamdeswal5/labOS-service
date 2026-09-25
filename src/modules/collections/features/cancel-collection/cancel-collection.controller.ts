import {
  Controller,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { CancelCollectionHandler } from './cancel-collection.handler';
import { CancelCollectionCommand } from './cancel-collection.command';
import { CancelCollectionDto } from './cancel-collection.dto';

@Controller('collections')
export class CancelCollectionController {
  constructor(private readonly handler: CancelCollectionHandler) { }

  @Post(':id/cancel')
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
