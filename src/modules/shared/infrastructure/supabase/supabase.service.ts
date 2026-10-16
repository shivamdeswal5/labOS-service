import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL') || '';
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase client initialized successfully');
  }

  
  getClient(): SupabaseClient {
    return this.client;
  }

  
  async getUserFromToken(token: string) {
    const { data: { user }, error } = await this.client.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  }

  
  async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    let { error } = await this.client.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error && error.message.toLowerCase().includes('bucket not found')) {
      this.logger.warn(`Storage bucket '${bucket}' not found. Auto-creating public bucket...`);
      await this.client.storage.createBucket(bucket, { public: true });
      const retry = await this.client.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });
      error = retry.error;
    }

    if (error) {
      this.logger.error(`Failed to upload file to ${bucket}/${filePath}: ${error.message}`);
      throw error;
    }

    const { data } = this.client.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}
