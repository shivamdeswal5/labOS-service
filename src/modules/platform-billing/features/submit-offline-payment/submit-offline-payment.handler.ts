import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SubmitOfflinePaymentCommand } from './submit-offline-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/payment/interfaces/payment-repository.interface';
import { PaymentStatusEnum } from '../../domain/enums/platform-billing.enums';
import { DuplicateUtrException } from '../../domain/exceptions/platform-billing.exceptions';

@Injectable()
export class SubmitOfflinePaymentHandler {
  private readonly logger = new Logger(SubmitOfflinePaymentHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(command: SubmitOfflinePaymentCommand): Promise<{
    success: boolean;
    utrNumber: string;
    message: string;
  }> {
    const { labId, dto } = command;
    const cleanUtr = dto.utrNumber.trim();

    // Check for duplicate UTR usage across all recorded payments
    const existingPayment = await this.paymentRepo.findByPaymentId(cleanUtr);
    if (existingPayment) {
      throw new DuplicateUtrException(cleanUtr);
    }

    const payment = await this.paymentRepo.findByOrderId(dto.orderId);
    if (!payment) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    if (payment.labId !== labId) {
      throw new BadRequestException('Order does not belong to your laboratory');
    }

    payment.providerPaymentId = cleanUtr;
    payment.paymentMethod = 'MANUAL_UTR';
    payment.status = PaymentStatusEnum.PENDING;
    payment.paymentDetails = {
      ...payment.paymentDetails,
      utrNumber: cleanUtr,
      bankName: dto.bankName || 'Direct NEFT/RTGS/UPI',
      notes: dto.notes,
      submittedAt: new Date().toISOString(),
      offlineStatus: 'PENDING_VERIFICATION',
    };

    await this.paymentRepo.save(payment);

    this.logger.log(
      `Lab ${labId} submitted offline UTR ${cleanUtr} for order ${dto.orderId}`,
    );

    return {
      success: true,
      utrNumber: cleanUtr,
      message:
        '12-digit UTR submitted successfully! Our billing desk will verify your bank transfer and activate your subscription.',
    };
  }
}
