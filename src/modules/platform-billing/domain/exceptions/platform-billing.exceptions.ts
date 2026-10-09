import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';

export class PlanNotFoundException extends DomainException {
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Subscription plan '${identifier}' was not found or is currently inactive`);
  }
}

export class SubscriptionNotFoundException extends DomainException {
  readonly statusCode = 404;

  constructor(labId: string) {
    super(`Active subscription was not found for laboratory '${labId}'`);
  }
}

export class PaymentNotFoundException extends DomainException {
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Payment with identifier '${identifier}' was not found`);
  }
}

export class InvalidWebhookSignatureException extends DomainException {
  readonly statusCode = 401;

  constructor() {
    super('Cryptographic webhook signature verification failed');
  }
}

export class DuplicateUtrException extends DomainException {
  readonly statusCode = 409;

  constructor(utrNumber: string) {
    super(`Bank UTR reference '${utrNumber}' has already been credited to another payment.`);
  }
}

