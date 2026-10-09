export class AdminPaymentListItemDto {
  id: string;
  labId: string;
  provider: string;
  method: string | null;
  amountInr: number;
  currency: string;
  status: string;
  providerPaymentId: string | null;
  providerOrderId: string | null;
  planName: string | null;
  billingCycle: string | null;
  createdAt: string;
  details: Record<string, any>;
}

export class AdminGetPaymentsResponseDto {
  items: AdminPaymentListItemDto[];
  total: number;
}
