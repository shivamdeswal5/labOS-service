import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from 'src/modules/shared/decorators/current-user.decorator';
import { ListDoctorLedgerHandler } from './list-doctor-ledger.handler';
import { ListDoctorLedgerQuery } from './list-doctor-ledger.query';
import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

@Controller('referrals/commission')
export class ListDoctorLedgerController {
  constructor(private readonly handler: ListDoctorLedgerHandler) {}

  @Get('doctor/:doctorId')
  async list(
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: CommissionStatusEnum,
  ) {
    return this.handler.execute(
      new ListDoctorLedgerQuery(doctorId, user.labId, status),
    );
  }
}
