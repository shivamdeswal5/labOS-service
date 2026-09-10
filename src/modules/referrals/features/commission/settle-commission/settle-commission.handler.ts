import { Inject, Injectable } from '@nestjs/common';
import { SettleCommissionCommand } from './settle-commission.command';
import {
  ICommissionLedgerRepository,
  COMMISSION_LEDGER_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import { DomainValidationException } from 'src/modules/shared/domain/exceptions/domain-validation.exception';

@Injectable()
export class SettleCommissionHandler {
  constructor(
    @Inject(COMMISSION_LEDGER_REPOSITORY_TOKEN)
    private readonly ledgerRepository: ICommissionLedgerRepository,
  ) {}

  async execute(command: SettleCommissionCommand): Promise<{ settledCount: number }> {
    const { labId, dto } = command;

    if (dto.entryIds && dto.entryIds.length > 0) {
      const settledCount = await this.ledgerRepository.settleEntries(dto.entryIds, labId);
      return { settledCount };
    }

    if (dto.doctorId) {
      const settledCount = await this.ledgerRepository.settleAllForDoctor(
        dto.doctorId,
        labId,
      );
      return { settledCount };
    }

    throw new DomainValidationException(
      'Either doctorId or entryIds must be provided to settle commission',
    );
  }
}
