import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { GetCollectionHandler } from './get-collection.handler';
import { GetCollectionQuery } from './get-collection.query';

@Controller('collections')
@UseGuards(AuthGuard)
export class GetCollectionController {
  constructor(private readonly handler: GetCollectionHandler) {}

  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.handler.execute(new GetCollectionQuery(user.labId, id));
  }
}
