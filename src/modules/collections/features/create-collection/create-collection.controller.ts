import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/shared/guards/auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { CreateCollectionHandler } from './create-collection.handler';
import { CreateCollectionCommand } from './create-collection.command';
import { CreateCollectionDto } from './create-collection.dto';

@Controller('collections')
@UseGuards(AuthGuard)
export class CreateCollectionController {
  constructor(private readonly handler: CreateCollectionHandler) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.handler.execute(new CreateCollectionCommand(user.labId, dto));
  }
}
