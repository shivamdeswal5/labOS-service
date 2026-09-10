import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationProvider,
  SendNotificationPayload,
  SendNotificationResult,
} from './interfaces/notification-provider.interface';

@Injectable()
export class WhatsAppCloudProvider implements INotificationProvider {
  private readonly logger = new Logger(WhatsAppCloudProvider.name);
  readonly name = 'whatsapp_cloud';

  constructor(private readonly configService: ConfigService) {}

  async send(payload: SendNotificationPayload): Promise<SendNotificationResult> {
    const apiToken = this.configService.get<string>('WHATSAPP_API_TOKEN');
    const phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );

    if (!apiToken || !phoneNumberId) {
      this.logger.warn(
        'WhatsApp Cloud API credentials not configured. Dispatched in degraded mode.',
      );
      return {
        success: false,
        provider: this.name,
        error: 'WhatsApp Cloud API credentials (token/phone_number_id) missing',
      };
    }

    try {
      const cleanPhone = payload.to.replace(/[^\d]/g, '');
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
              preview_url: true,
              body: payload.message,
            },
          }),
        },
      );

      const result = (await response.json()) as any;

      if (!response.ok) {
        const errorMsg =
          result?.error?.message || `HTTP ${response.status} WhatsApp error`;
        this.logger.error(`WhatsApp Cloud API error: ${errorMsg}`);
        return {
          success: false,
          provider: this.name,
          error: errorMsg,
        };
      }

      const messageId = result?.messages?.[0]?.id;

      return {
        success: true,
        provider: this.name,
        providerMessageId: messageId,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to dispatch WhatsApp message to ${payload.to}`,
        error.stack,
      );
      return {
        success: false,
        provider: this.name,
        error: error.message || 'Unknown network error',
      };
    }
  }
}
