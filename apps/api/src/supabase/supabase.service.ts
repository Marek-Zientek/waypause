import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;
  readonly adminClient: SupabaseClient;

  constructor() {
    const url = process.env['SUPABASE_URL'];
    const anonKey = process.env['SUPABASE_ANON_KEY'];
    const serviceKey = process.env['SUPABASE_SERVICE_KEY'];

    if (!url || !anonKey || !serviceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.client = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
