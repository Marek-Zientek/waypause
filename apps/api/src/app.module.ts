import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { RoutesModule } from './routes/routes.module';
import { AiSuggestionsModule } from './ai-suggestions/ai-suggestions.module';

@Module({
  imports: [SupabaseModule, UsersModule, AuthModule, RoutesModule, AiSuggestionsModule],
})
export class AppModule {}
