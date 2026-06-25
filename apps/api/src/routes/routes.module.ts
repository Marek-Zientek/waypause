import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
