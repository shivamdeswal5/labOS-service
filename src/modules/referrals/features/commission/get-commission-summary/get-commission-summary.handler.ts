import { Inject, Injectable } from '@nestjs/common';
import { GetCommissionSummaryQuery } from './get-commission-summary.query';
import {
  ICommissionLedgerRepository,
  COMMISSION_LEDGER_REPOSITORY_TOKEN,
  ILabCommissionSummary,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';

@Injectable()
export class GetCommissionSummaryHandler {
  constructor(
    @Inject(COMMISSION_LEDGER_REPOSITORY_TOKEN)
    private readonly ledgerRepository: ICommissionLedgerRepository,
  ) {}

  async execute(query: GetCommissionSummaryQuery): Promise<ILabCommissionSummary> {
    return this.ledgerRepository.getLabSummary(query.labId);
  }
}
