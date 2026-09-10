import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from 'src/modules/billing/domain/invoice/invoice.entity';
import {
  IInvoiceRepository,
  FindInvoicesFilter,
} from 'src/modules/billing/domain/invoice/interfaces/invoice-repository.interface';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findById(id: string, labId: string): Promise<Invoice | null> {
    return this.invoiceRepo.findOne({
      where: { id, labId },
      relations: { items: true },
    });
  }

  async findByReportId(reportId: string, labId: string): Promise<Invoice | null> {
    return this.invoiceRepo.findOne({
      where: { reportId, labId },
      relations: { items: true },
    });
  }

  async findByLabId(
    labId: string,
    filter?: FindInvoicesFilter,
  ): Promise<Invoice[]> {
    const query = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.lab_id = :labId', { labId })
      .andWhere('invoice.deleted_at IS NULL');

    if (filter?.status !== undefined) {
      query.andWhere('invoice.payment_status = :status', { status: filter.status });
    }

    if (filter?.patientId) {
      query.andWhere('invoice.patient_id = :patientId', {
        patientId: filter.patientId,
      });
    }

    if (filter?.reportId) {
      query.andWhere('invoice.report_id = :reportId', {
        reportId: filter.reportId,
      });
    }

    return query
      .orderBy('invoice.created_at', 'DESC')
      .getMany();
  }

  async save(invoice: Invoice): Promise<Invoice> {
    return this.invoiceRepo.save(invoice);
  }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.invoiceRepo.create(data);
    return this.invoiceRepo.save(invoice);
  }

  async generateInvoiceNumber(labId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.lab_id = :labId', { labId })
      .getCount();

    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
