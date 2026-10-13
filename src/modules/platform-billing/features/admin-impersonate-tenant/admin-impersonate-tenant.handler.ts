import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ILabRepository,
  LAB_REPOSITORY_TOKEN,
} from 'src/modules/labs/domain/lab/interfaces/lab.repository.interface';
import { SupabaseService } from 'src/modules/shared/infrastructure/supabase/supabase.service';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { AdminImpersonateTenantCommand } from './admin-impersonate-tenant.command';

export interface AdminImpersonateResult {
  success: boolean;
  labId: string;
  labName: string;
  ownerEmail: string;
  magicLink: string;
}

@Injectable()
export class AdminImpersonateTenantHandler {
  private readonly logger = new Logger(AdminImpersonateTenantHandler.name);

  constructor(
    @Inject(LAB_REPOSITORY_TOKEN)
    private readonly labRepo: ILabRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(command: AdminImpersonateTenantCommand): Promise<AdminImpersonateResult> {
    const { labId, adminEmail } = command;
    const lab = await this.labRepo.findById(labId);

    if (!lab) {
      throw new NotFoundException(`Laboratory '${labId}' not found`);
    }

    const ownerProfile =
      lab.profiles?.find((p) => p.role === RoleEnum.OWNER) || lab.profiles?.[0];

    if (!ownerProfile) {
      throw new NotFoundException(`No administrator profile found for lab '${lab.name}'`);
    }

    // Lookup user email from Supabase Auth
    const authUser = await this.supabaseService
      .getClient()
      .auth.admin.getUserById(ownerProfile.id);

    const ownerEmail = authUser.data.user?.email;
    if (!ownerEmail) {
      throw new NotFoundException(`Supabase auth user '${ownerProfile.id}' not found`);
    }

    // Generate secure single-use support login link
    const linkResult = await this.supabaseService
      .getClient()
      .auth.admin.generateLink({
        type: 'magiclink',
        email: ownerEmail,
      });

    if (linkResult.error || !linkResult.data?.properties?.action_link) {
      throw new Error(
        `Failed to generate support magic link: ${linkResult.error?.message || 'Unknown error'}`,
      );
    }

    const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
    const hashedToken = linkResult.data.properties.hashed_token;
    const cleanCallbackUrl = hashedToken
      ? `${appBaseUrl}/auth/callback?token_hash=${hashedToken}&type=magiclink&support=true&lab_name=${encodeURIComponent(lab.name)}`
      : linkResult.data.properties.action_link;

    this.logger.log(
      `[Support Impersonation] Lab: ${lab.id} (${lab.name}) | Owner: ${ownerEmail} | Admin: ${adminEmail}`,
    );

    return {
      success: true,
      labId: lab.id,
      labName: lab.name,
      ownerEmail,
      magicLink: cleanCallbackUrl,
    };
  }
}
