import { PaymentProviderEnum } from '../../enums/platform-billing.enums';

export interface IWebhookEventRepository {
  reserveEvent(
    eventId: string,
    provider: PaymentProviderEnum,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<string | null>;
  markProcessed(id: string): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
}

export const WEBHOOK_EVENT_REPOSITORY_TOKEN = Symbol('IWebhookEventRepository');
