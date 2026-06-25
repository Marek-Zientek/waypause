import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompts';
import type { Route } from '../routes/routes.service';

const SuggestionSchema = z.array(
  z.object({
    city: z.string().min(1),
    reason: z.string().min(1),
    detour_minutes: z.number().int().min(0),
    visit_duration_minutes: z.number().int().min(1),
  }),
).min(1).max(5);

export type Suggestion = z.infer<typeof SuggestionSchema>[number];

@Injectable()
export class AiSuggestionsService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(AiSuggestionsService.name);

  constructor() {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  async suggestStops(route: Route): Promise<Suggestion[]> {
    const userPrompt = buildUserPrompt(
      route.origin,
      route.destination,
      route.travel_time_minutes,
    );

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('');

      const parsed = JSON.parse(text) as unknown;
      return SuggestionSchema.parse(parsed);
    } catch (err) {
      this.logger.error('Claude API error or invalid response', err);
      return this.fallback(route);
    }
  }

  private fallback(route: Route): Suggestion[] {
    this.logger.warn(`Returning fallback suggestions for route ${route.id}`);
    return [
      {
        city: 'Łódź',
        reason: 'Sugestie AI tymczasowo niedostępne. Łódź to duże miasto z bogatą ofertą kulturalną.',
        detour_minutes: 0,
        visit_duration_minutes: 60,
      },
    ];
  }
}
