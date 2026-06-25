import { Module } from '@nestjs/common';
import { AiSuggestionsService } from './ai-suggestions.service';
import { AiSuggestionsController } from './ai-suggestions.controller';
import { RoutesModule } from '../routes/routes.module';

@Module({
  imports: [RoutesModule],
  providers: [AiSuggestionsService],
  controllers: [AiSuggestionsController],
})
export class AiSuggestionsModule {}
