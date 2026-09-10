import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  INotificationProvider,
  SendNotificationPayload,
  SendNotificationResult,
} from './interfaces/notification-provider.interface';

@Injectable()
export class MockNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(MockNotificationProvider.name);
  readonly name = 'mock';

  async send(payload: SendNotificationPayload): Promise<SendNotificationResult> {
    const mockId = `mock_msg_${randomUUID()}`;

    this.logger.log({
      message: `[MOCK NOTIFICATION DISPATCHED]`,
      channel: payload.channel,
      destination: payload.to,
      recipient: payload.recipientName,
      content: payload.message,
      messageId: mockId,
      metadata: payload.metadata,
    });

    return {
      success: true,
      provider: this.name,
      providerMessageId: mockId,
    };
  }
}
