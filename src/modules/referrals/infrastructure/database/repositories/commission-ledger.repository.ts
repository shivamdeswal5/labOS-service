import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DoctorCommissionLedger } from 'src/modules/referrals/domain/commission/doctor-commission-ledger.entity';
import {
  ICommissionLedgerRepository,
  IDoctorBalance,
  ILabCommissionSummary,
} from 'src/modules/referrals/domain/commission/interfaces/commission-ledger-repository.interface';
import { CommissionStatusEnum } from 'src/modules/referrals/domain/commission/enums/commission-status.enum';

@Injectable()
export class CommissionLedgerRepository implements ICommissionLedgerRepository {
  constructor(
    @InjectRepository(DoctorCommissionLedger)
    private readonly ledgerRepo: Repository<DoctorCommissionLedger>,
  ) {}

  async findById(id: string, labId: string): Promise<DoctorCommissionLedger | null> {
    return this.ledgerRepo.findOne({
      where: { id, labId },
      relations: { doctor: true },
    });
  }

  async findByDoctorId(
    labId: string,
    doctorId: string,
    status?: CommissionStatusEnum,
  ): Promise<DoctorCommissionLedger[]> {
    const query = this.ledgerRepo
      .createQueryBuilder('ledger')
      .where('ledger.lab_id = :labId', { labId })
      .andWhere('ledger.doctor_id = :doctorId', { doctorId });

    if (status !== undefined) {
      query.andWhere('ledger.status = :status', { status });
    }

    return query
      .orderBy('ledger.created_at', 'DESC')
      .getMany();
  }

  async findByLabId(
    labId: string,
    status?: CommissionStatusEnum,
  ): Promise<DoctorCommissionLedger[]> {
    const query = this.ledgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.doctor', 'doctor')
      .where('ledger.lab_id = :labId', { labId });

    if (status !== undefined) {
      query.andWhere('ledger.status = :status', { status });
    }

    return query
      .orderBy('ledger.created_at', 'DESC')
      .getMany();
  }

  async getDoctorBalance(labId: string, doctorId: string): Promise<IDoctorBalance> {
    const raw = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select([
        `COALESCE(SUM(CASE WHEN ledger.status = ${CommissionStatusEnum.PENDING ? 0 : 0} THEN ledger.amount ELSE 0 END), 0) AS "pendingAmount"`,
        `COALESCE(SUM(CASE WHEN ledger.status = ${CommissionStatusEnum.SETTLED ? 1 : 1} THEN ledger.amount ELSE 0 END), 0) AS "settledAmount"`,
      ])
      .where('ledger.lab_id = :labId', { labId })
      .andWhere('ledger.doctor_id = :doctorId', { doctorId })
      .getRawOne();

    return {
      pendingAmount: parseFloat(raw?.pendingAmount || '0'),
      settledAmount: parseFloat(raw?.settledAmount || '0'),
    };
  }

  async getLabSummary(labId: string): Promise<ILabCommissionSummary> {
    const raw = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select([
        `COALESCE(SUM(CASE WHEN ledger.status = ${CommissionStatusEnum.PENDING ? 0 : 0} THEN ledger.amount ELSE 0 END), 0) AS "totalPending"`,
        `COALESCE(SUM(CASE WHEN ledger.status = ${CommissionStatusEnum.SETTLED ? 1 : 1} THEN ledger.amount ELSE 0 END), 0) AS "totalSettled"`,
        'COUNT(DISTINCT ledger.doctor_id) AS "doctorCount"',
      ])
      .where('ledger.lab_id = :labId', { labId })
      .getRawOne();

    return {
      totalPending: parseFloat(raw?.totalPending || '0'),
      totalSettled: parseFloat(raw?.totalSettled || '0'),
      doctorCount: parseInt(raw?.doctorCount || '0', 10),
    };
  }

  async save(entry: DoctorCommissionLedger): Promise<DoctorCommissionLedger> {
    return this.ledgerRepo.save(entry);
  }

  async create(data: Partial<DoctorCommissionLedger>): Promise<DoctorCommissionLedger> {
    const entry = this.ledgerRepo.create(data);
    return this.ledgerRepo.save(entry);
  }

  async settleEntries(ids: string[], labId: string): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await this.ledgerRepo.update(
      { id: In(ids), labId, status: CommissionStatusEnum.PENDING },
      { status: CommissionStatusEnum.SETTLED, settledAt: new Date() },
    );

    return result.affected ?? 0;
  }

  async settleAllForDoctor(doctorId: string, labId: string): Promise<number> {
    const result = await this.ledgerRepo.update(
      { doctorId, labId, status: CommissionStatusEnum.PENDING },
      { status: CommissionStatusEnum.SETTLED, settledAt: new Date() },
    );

    return result.affected ?? 0;
  }
}
