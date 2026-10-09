import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
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
import { AdminManualActivationHandler } from '../admin-manual-activation/admin-manual-activation.handler';
import { AdminManualActivationCommand } from '../admin-manual-activation/admin-manual-activation.command';
import { AdminCreateTenantCommand } from './admin-create-tenant.command';
import { AdminOnboardPaymentStatusEnum } from './admin-create-tenant.dto';
import { SubscriptionStatusEnum } from '../../domain/enums/platform-billing.enums';
import { PlanNotFoundException } from '../../domain/exceptions/platform-billing.exceptions';

export interface AdminCreateTenantResult {
  success: boolean;
  labId: string;
  labName: string;
  ownerEmail: string;
  tempPassword?: string;
  planSlug: string;
  status: string;
  invoiceNumber?: string;
}

@Injectable()
export class AdminCreateTenantHandler {
  private readonly logger = new Logger(AdminCreateTenantHandler.name);

  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepository: ILabRepository,
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepo: IPlanRepository,
    private readonly supabaseService: SupabaseService,
    private readonly manualActivationHandler: AdminManualActivationHandler,
  ) {}

  async execute(command: AdminCreateTenantCommand): Promise<AdminCreateTenantResult> {
    const { dto, adminEmail } = command;
    const cleanEmail = dto.ownerEmail.trim().toLowerCase();
    const generatedPassword = dto.ownerPassword?.trim() || `Pathiq@${randomBytes(3).toString('hex').toUpperCase()}`;

    // 1. Resolve or create user in Supabase Auth
    const supabaseClient = this.supabaseService.getClient();
    let userId: string;

    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers({ perPage: 1000 });
    const existing = existingUsers?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (existing) {
      userId = existing.id;
      this.logger.log(`Using existing Supabase Auth user ${userId} for ${cleanEmail}`);
    } else {
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: cleanEmail,
        password: generatedPassword,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        this.logger.error(`Failed to provision Supabase user for ${cleanEmail}: ${createError?.message}`);
        throw new BadRequestException(`Failed to create owner account: ${createError?.message || 'Unknown error'}`);
      }

      userId = newUser.user.id;
      this.logger.log(`Created new Supabase Auth user ${userId} for ${cleanEmail}`);
    }

    // 2. Create Lab and Owner Profile
    const lab = await this.labRepository.createLabWithOwner(
      {
        name: dto.labName.trim(),
        address: dto.city.trim(),
        phoneNumbers: [dto.phoneNumber.trim()],
        accentColor: '#0f766e',
        tagline: 'Precision Diagnostics & Pathology',
        footerNote: 'NOT VALID FOR MEDICO LEGAL PURPOSE',
      },
      {
        id: userId,
        fullName: dto.ownerFullName.trim(),
      },
    );

    // 3. Resolve Platform Plan
    const plan = await this.planRepo.findBySlug(dto.planSlug);
    if (!plan) {
      throw new PlanNotFoundException(dto.planSlug);
    }

    let invoiceNumber: string | undefined;
    let finalStatus = SubscriptionStatusEnum.TRIALING;

    // 4. Handle Subscription & Payment
    if (dto.paymentStatus === AdminOnboardPaymentStatusEnum.PAID) {
      if (!dto.utrNumber?.trim()) {
        throw new BadRequestException('UTR reference is required when marking tenant as PAID');
      }

      const activationResult = await this.manualActivationHandler.execute(
        new AdminManualActivationCommand(
          {
            labId: lab.id,
            planSlug: dto.planSlug,
            billingCycle: dto.billingCycle,
            utrNumber: dto.utrNumber.trim(),
            notes: dto.notes || `Onboarded directly by ${adminEmail}`,
          },
          adminEmail,
        ),
      );

      invoiceNumber = activationResult.invoiceNumber;
      finalStatus = SubscriptionStatusEnum.ACTIVE;
    } else {
      // 14-day Free Trial
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const trialSub = this.subscriptionRepo.create({
        labId: lab.id,
        planId: plan.id,
        status: SubscriptionStatusEnum.TRIALING,
        billingCycle: dto.billingCycle,
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        gracePeriodEnd: null,
      });
      await this.subscriptionRepo.save(trialSub);
    }

    this.logger.log(`[Admin Onboard] Lab: ${lab.name} (${lab.id}) | Owner: ${cleanEmail} | Status: ${finalStatus}`);

    return {
      success: true,
      labId: lab.id,
      labName: lab.name,
      ownerEmail: cleanEmail,
      tempPassword: generatedPassword,
      planSlug: plan.slug,
      status: finalStatus,
      invoiceNumber,
    };
  }
}
