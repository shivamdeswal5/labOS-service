export enum PlanSlugEnum {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  SCALE = 'SCALE',
}

export enum SubscriptionStatusEnum {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  LOCKED = 'LOCKED',
  CANCELED = 'CANCELED',
  SUSPENDED = 'SUSPENDED',
}

export enum BillingCycleEnum {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProviderEnum {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  MANUAL = 'MANUAL',
}

export enum WebhookEventStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}
