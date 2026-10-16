import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { WebsocketsModule } from '../../../websockets/websockets.module';
import { SimulatePaymentCaptureController } from './simulate-payment-capture.controller';
import { SimulatePaymentCaptureHandler } from './simulate-payment-capture.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, WebsocketsModule],
  controllers: [SimulatePaymentCaptureController],
  providers: [SimulatePaymentCaptureHandler],
  exports: [SimulatePaymentCaptureHandler],
})
export class SimulatePaymentCaptureModule {}
