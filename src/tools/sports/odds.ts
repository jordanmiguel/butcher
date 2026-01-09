import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveBetId, resolveBookmakerId, resolveLeagueId } from './api.js';
import { normalizeLeague, normalizeMarketType } from './constants.js';
import { formatToolResult } from '../types.js';

const MatchOddsInputSchema = z.object({
  fixture_id: z.string().optional().describe('Fixture identifier to fetch odds for.'),
  league: z.string().optional().describe('League name or code for context.'),
  season: z.string().optional().describe('Season year in YYYY format.'),
  date: z.string().optional().describe('Fixture date in YYYY-MM-DD format.'),
  bookmaker: z
    .string()
    .optional()
    .describe('Bookmaker id or name to filter odds (e.g. 6 or Betfair).'),
  market: z
    .string()
    .default('Match Winner')
    .describe('Market type or bet name (e.g. Match Winner, BTTS, Goals Over/Under).'),
  page: z.number().int().min(1).max(20).optional().describe('Pagination page number.'),
  timezone: z.string().optional().describe('Timezone identifier from the API timezone list.'),
});

export const getFootballMatchOdds = new DynamicStructuredTool({
  name: 'get_football_match_odds',
  description: 'Fetches betting odds for a specific football match and market.',
  schema: MatchOddsInputSchema,
  func: async (input) => {
    const leagueName = input.league ? normalizeLeague(input.league) : undefined;
    const market = normalizeMarketType(input.market);
    const leagueId = leagueName ? await resolveLeagueId(leagueName) : undefined;
    const betId = await resolveBetId(market);
    const bookmakerId = input.bookmaker
      ? await resolveBookmakerId(input.bookmaker)
      : undefined;
    const params = {
      fixture: input.fixture_id,
      league: leagueId,
      season: input.season,
      date: input.date,
      bet: betId,
      bookmaker: bookmakerId,
      page: input.page,
      timezone: input.timezone,
    };
    const { data, url } = await callApi('/odds', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      league: leagueName,
      leagueId,
      market,
      betId,
      bookmaker: input.bookmaker,
      bookmakerId,
      season: input.season,
    });
  },
});
