import { Module } from '@nestjs/common';
import { AiSuggestionsService } from './ai-suggestions.service';
import { AiSuggestionsController } from './ai-suggestions.controller';
import { RoutesModule } from '../routes/routes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RoutesModule, AuthModule],
  providers: [AiSuggestionsService],
  controllers: [AiSuggestionsController],
})
export class AiSuggestionsModule {}
