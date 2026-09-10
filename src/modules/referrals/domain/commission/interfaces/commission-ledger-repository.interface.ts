import { DoctorCommissionLedger } from '../doctor-commission-ledger.entity';
import { CommissionStatusEnum } from '../enums/commission-status.enum';

export const COMMISSION_LEDGER_REPOSITORY_TOKEN = Symbol('ICommissionLedgerRepository');

export interface IDoctorBalance {
  pendingAmount: number;
  settledAmount: number;
}

export interface ILabCommissionSummary {
  totalPending: number;
  totalSettled: number;
  doctorCount: number;
}

export interface ICommissionLedgerRepository {
  findById(id: string, labId: string): Promise<DoctorCommissionLedger | null>;
  findByDoctorId(
    labId: string,
    doctorId: string,
    status?: CommissionStatusEnum,
  ): Promise<DoctorCommissionLedger[]>;
  findByLabId(
    labId: string,
    status?: CommissionStatusEnum,
  ): Promise<DoctorCommissionLedger[]>;
  getDoctorBalance(labId: string, doctorId: string): Promise<IDoctorBalance>;
  getLabSummary(labId: string): Promise<ILabCommissionSummary>;
  save(entry: DoctorCommissionLedger): Promise<DoctorCommissionLedger>;
  create(data: Partial<DoctorCommissionLedger>): Promise<DoctorCommissionLedger>;
  settleEntries(ids: string[], labId: string): Promise<number>;
  settleAllForDoctor(doctorId: string, labId: string): Promise<number>;
}
