import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId } from './api.js';
import { normalizeLeague } from './constants.js';
import { formatToolResult } from '../types.js';

const TopYellowCardsInputSchema = z.object({
  league: z.string().describe('League name or code to fetch top yellow cards.'),
  season: z.string().describe('Season year in YYYY format.'),
});

export const getFootballTopYellowCards = new DynamicStructuredTool({
  name: 'get_football_top_yellow_cards',
  description: 'Fetches players with the most yellow cards for a league season.',
  schema: TopYellowCardsInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const leagueId = await resolveLeagueId(leagueName);
    const params = {
      league: leagueId,
      season: input.season,
    };
    const { data, url } = await callApi('/players/topyellowcards', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
    });
  },
});
