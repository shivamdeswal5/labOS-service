import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  PgBossService,
  QUEUE_NAMES,
} from 'src/modules/shared/infrastructure/queue/pg-boss.service';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import { SubscriptionInvoicePdfGeneratorService } from './subscription-invoice-pdf-generator.service';
import { SupabaseService } from 'src/modules/shared/infrastructure/supabase/supabase.service';

export interface SubscriptionInvoicePdfJobData {
  invoiceId: string;
  labId: string;
}

@Injectable()
export class SubscriptionInvoicePdfWorker implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionInvoicePdfWorker.name);

  constructor(
    private readonly queueService: PgBossService,
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubscriptionRepository,
    private readonly generator: SubscriptionInvoicePdfGeneratorService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queueService.registerWorker<SubscriptionInvoicePdfJobData>(
      QUEUE_NAMES.GENERATE_SUBSCRIPTION_INVOICE_PDF,
      async ({ id, data }) => {
        const start = Date.now();
        this.logger.log(
          `[pg-boss] Processing invoice PDF generation for Invoice ID [${data.invoiceId}] (Job ${id})`,
        );

        try {
          const invoice = await this.paymentRepo.findInvoiceById(data.invoiceId);
          if (!invoice) {
            this.logger.warn(`[pg-boss] Invoice not found: ${data.invoiceId}`);
            return;
          }

          const subscription = await this.subRepo.findByLabId(data.labId);

          const pdfBuffer = await this.generator.generatePdf({
            invoice,
            planName: subscription?.plan?.name || 'Growth Tier',
            billingCycle: subscription?.billingCycle || 'MONTHLY',
          });

          // Upload to Supabase Storage
          try {
            const bucket = 'lab-assets';
            const filePath = `invoices/${invoice.invoiceNumber}.pdf`;
            const publicUrl = await this.supabaseService.uploadFile(
              bucket,
              filePath,
              pdfBuffer,
              'application/pdf',
            );

            invoice.pdfUrl = publicUrl;
            await this.paymentRepo.saveInvoice(invoice);
            this.logger.log(`[pg-boss] Invoice PDF uploaded to storage: ${publicUrl}`);
          } catch (uploadErr: any) {
            this.logger.warn(`[pg-boss] Storage upload skipped/failed: ${uploadErr.message}`);
          }

          const duration = Date.now() - start;
          this.logger.log(
            `[pg-boss] Successfully generated invoice PDF [${invoice.invoiceNumber}] in ${duration}ms`,
          );
        } catch (error: any) {
          this.logger.error(
            `[pg-boss] Failed to generate invoice PDF for [${data.invoiceId}]: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
    );
  }
}
