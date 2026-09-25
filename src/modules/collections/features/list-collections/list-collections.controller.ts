import { Controller, Get, Query } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/modules/shared/decorators/current-user.decorator';
import { ListCollectionsHandler } from './list-collections.handler';
import { ListCollectionsQuery } from './list-collections.query';
import { CollectionStatusEnum } from '../../domain/collection/enums/collection-status.enum';

@Controller('collections')
export class ListCollectionsController {
  constructor(private readonly handler: ListCollectionsHandler) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: CollectionStatusEnum,
    @Query('phlebotomistId') phlebotomistId?: string,
    @Query('preferredDate') preferredDate?: string,
    @Query('patientPhone') patientPhone?: string,
  ) {
    return this.handler.execute(
      new ListCollectionsQuery(
        user.labId,
        status,
        phlebotomistId,
        preferredDate,
        patientPhone,
      ),
    );
  }
}
