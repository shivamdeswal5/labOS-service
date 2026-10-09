import { Inject, Injectable } from '@nestjs/common';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import { SupabaseService } from 'src/modules/shared/infrastructure/supabase/supabase.service';
import { AdminTenantListItemDto } from './admin-tenant-list-item.dto';
import { AdminGetTenantsQuery } from './admin-get-tenants.query';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { SubscriptionStatusEnum, BillingCycleEnum } from '../../domain/enums/platform-billing.enums';

@Injectable()
export class AdminGetTenantsHandler {
  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(_query: AdminGetTenantsQuery): Promise<AdminTenantListItemDto[]> {
    const [labs, subscriptions, authUsersResult] = await Promise.all([
      this.labRepository.findAll(),
      this.subscriptionRepository.findAll(),
      this.supabaseService
        .getClient()
        .auth.admin.listUsers({ perPage: 1000 })
        .catch(() => ({ data: { users: [] }, error: null })),
    ]);

    const userEmailMap = new Map<string, string>(
      (authUsersResult?.data?.users || []).map((u) => [u.id, u.email || '']),
    );

    const subMap = new Map(subscriptions.map((s) => [s.labId, s]));
    const now = new Date();

    return labs.map((lab) => {
      const sub = subMap.get(lab.id);
      const ownerProfile =
        lab.profiles?.find((p) => p.role === RoleEnum.OWNER) || lab.profiles?.[0];

      let daysRemaining = 0;
      if (sub?.status === SubscriptionStatusEnum.ACTIVE && sub.currentPeriodEnd) {
        daysRemaining = Math.max(
          0,
          Math.ceil(
            (new Date(sub.currentPeriodEnd).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
      } else if (sub?.trialEnd) {
        daysRemaining = Math.max(
          0,
          Math.ceil(
            (new Date(sub.trialEnd).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
      }

      const phone =
        lab.phoneNumbers && lab.phoneNumbers.length > 0
          ? lab.phoneNumbers[0]
          : '';

      const ownerEmail = ownerProfile?.id ? userEmailMap.get(ownerProfile.id) || '' : '';

      return {
        labId: lab.id,
        labName: lab.name,
        city: lab.address || 'India',
        phone,
        ownerName: ownerProfile?.fullName || 'Lab Administrator',
        ownerEmail,
        planSlug: sub?.plan?.slug || 'STARTER',
        planName: sub?.plan?.name || 'Starter Plan',
        status: sub?.status || SubscriptionStatusEnum.TRIALING,
        billingCycle: sub?.billingCycle || BillingCycleEnum.MONTHLY,
        trialStart: sub?.trialStart ? new Date(sub.trialStart).toISOString() : new Date().toISOString(),
        trialEnd: sub?.trialEnd ? new Date(sub.trialEnd).toISOString() : new Date().toISOString(),
        currentPeriodEnd: sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        daysRemaining,
        createdAt: new Date(lab.createdAt).toISOString(),
      };
    });
  }
}
