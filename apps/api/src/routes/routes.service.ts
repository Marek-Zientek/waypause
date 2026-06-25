import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Route {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  travel_time_minutes: number | null;
}

@Injectable()
export class RoutesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(id: string, userId: string): Promise<Route> {
    const { data, error } = await this.supabase.adminClient
      .from('routes')
      .select('id, user_id, origin, destination, travel_time_minutes')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Trasa nie istnieje');
    return data as Route;
  }
}
