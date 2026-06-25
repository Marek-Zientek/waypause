import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiSuggestionsService } from './ai-suggestions.service';
import { RoutesService } from '../routes/routes.service';

interface JwtUser {
  sub: string;
  email: string;
}

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class AiSuggestionsController {
  constructor(
    private readonly aiService: AiSuggestionsService,
    private readonly routesService: RoutesService,
  ) {}

  @Post(':id/suggest-stops')
  async suggestStops(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtUser;
    const route = await this.routesService.findById(id, user.sub);
    const suggestions = await this.aiService.suggestStops(route);
    return { suggestions };
  }
}
