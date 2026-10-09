export class AdminTenantListItemDto {
  labId: string;
  labName: string;
  city: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  planSlug: string;
  planName: string;
  status: string;
  billingCycle: string;
  trialStart: string;
  trialEnd: string;
  currentPeriodEnd: string | null;
  daysRemaining: number;
  createdAt: string;
}
