import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY_TOKEN,
} from '../../domain/subscription/interfaces/subscription-repository.interface';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/plan/interfaces/plan-repository.interface';
import { SupabaseService } from 'src/modules/shared/infrastructure/supabase/supabase.service';
import { AdminTenantListItemDto } from './admin-tenant-list-item.dto';
import { AdminGetTenantsQuery } from './admin-get-tenants.query';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import {
  SubscriptionStatusEnum,
  BillingCycleEnum,
  PlanSlugEnum,
} from '../../domain/enums/platform-billing.enums';

@Injectable()
export class AdminGetTenantsHandler {
  private readonly logger = new Logger(AdminGetTenantsHandler.name);

  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepository: IPlanRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(_query: AdminGetTenantsQuery): Promise<AdminTenantListItemDto[]> {
    const [labs, subscriptions, authUsersResult, defaultPlan] = await Promise.all([
      this.labRepository.findAll(),
      this.subscriptionRepository.findAll(),
      this.supabaseService
        .getClient()
        .auth.admin.listUsers({ perPage: 1000 })
        .catch(() => ({ data: { users: [] }, error: null })),
      this.planRepository.findBySlug(PlanSlugEnum.STARTER),
    ]);

    const userEmailMap = new Map<string, string>(
      (authUsersResult?.data?.users || []).map((u) => [u.id, u.email || '']),
    );

    const subMap = new Map(subscriptions.map((s) => [s.labId, s]));
    const now = new Date();

    const items: AdminTenantListItemDto[] = [];

    for (const lab of labs) {
      let sub = subMap.get(lab.id);

      // JIT Self-Healing: If lab has no subscription record, auto-provision 14-day trial
      if (!sub && defaultPlan) {
        try {
          const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          const newSub = this.subscriptionRepository.create({
            labId: lab.id,
            planId: defaultPlan.id,
            status: SubscriptionStatusEnum.TRIALING,
            billingCycle: BillingCycleEnum.MONTHLY,
            trialStart: now,
            trialEnd,
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            gracePeriodEnd: null,
          });
          sub = await this.subscriptionRepository.save(newSub);
          sub.plan = defaultPlan;
          subMap.set(lab.id, sub);
          this.logger.log(`[Admin JIT Self-Healing] Auto-provisioned trial for lab ${lab.id} (${lab.name}).`);
        } catch {
          this.logger.warn(`Failed to auto-provision trial in AdminGetTenants for lab ${lab.id}`);
        }

      }

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

      items.push({
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
        trialStart: sub?.trialStart ? new Date(sub.trialStart).toISOString() : now.toISOString(),
        trialEnd: sub?.trialEnd ? new Date(sub.trialEnd).toISOString() : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodEnd: sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        daysRemaining,
        createdAt: new Date(lab.createdAt).toISOString(),
      });
    }

    return items;
  }
}
