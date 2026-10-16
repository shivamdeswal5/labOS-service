import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformPayment } from '../../../domain/entities/platform-payment.entity';
import { SubscriptionInvoice } from '../../../domain/entities/subscription-invoice.entity';
import { IPaymentRepository } from '../../../domain/payment/interfaces/payment-repository.interface';
import { PaymentStatusEnum } from '../../../domain/enums/platform-billing.enums';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PlatformPayment)
    private readonly repo: Repository<PlatformPayment>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
  ) {}

  async findById(id: string): Promise<PlatformPayment | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByOrderId(providerOrderId: string): Promise<PlatformPayment | null> {
    return this.repo.findOne({ where: { providerOrderId } });
  }

  async findByPaymentId(providerPaymentId: string): Promise<PlatformPayment | null> {
    return this.repo.findOne({ where: { providerPaymentId } });
  }

  async findRecentPending(
    labId: string,
    amountInPaise: number,
    since: Date,
  ): Promise<PlatformPayment | null> {
    return this.repo
      .createQueryBuilder('p')
      .where('p.lab_id = :labId', { labId })
      .andWhere('p.amount_in_paise = :amountInPaise', { amountInPaise })
      .andWhere('p.status = :status', { status: PaymentStatusEnum.PENDING })
      .andWhere('p.created_at > :since', { since })
      .orderBy('p.created_at', 'DESC')
      .getOne();
  }

  async findStalePending(olderThan: Date, newerThan: Date): Promise<PlatformPayment[]> {
    return this.repo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: PaymentStatusEnum.PENDING })
      .andWhere('p.created_at < :olderThan', { olderThan })
      .andWhere('p.created_at > :newerThan', { newerThan })
      .getMany();
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<{ items: PlatformPayment[]; total: number }> {
    const [items, total] = await this.repo.findAndCount({
      relations: { subscription: { plan: true } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  async save(payment: PlatformPayment): Promise<PlatformPayment> {
    return this.repo.save(payment);
  }

  create(data: Partial<PlatformPayment>): PlatformPayment {
    return this.repo.create(data);
  }

  async createInvoice(data: Partial<SubscriptionInvoice>): Promise<SubscriptionInvoice> {
    const inv = this.invoiceRepo.create(data);
    return this.invoiceRepo.save(inv);
  }

  async findInvoiceById(id: string): Promise<SubscriptionInvoice | null> {
    return this.invoiceRepo.findOne({
      where: { id },
      relations: { payment: true },
    });
  }

  async findInvoicesByLabId(labId: string): Promise<SubscriptionInvoice[]> {
    return this.invoiceRepo.find({
      where: { labId },
      relations: { payment: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoicesMissingPdf(olderThan: Date, newerThan: Date): Promise<SubscriptionInvoice[]> {
    return this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.pdf_url IS NULL')
      .andWhere('inv.created_at < :olderThan', { olderThan })
      .andWhere('inv.created_at > :newerThan', { newerThan })
      .orderBy('inv.created_at', 'ASC')
      .take(25)
      .getMany();
  }

  async saveInvoice(invoice: SubscriptionInvoice): Promise<SubscriptionInvoice> {
    return this.invoiceRepo.save(invoice);
  }
}
