import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId } from './api.js';
import { normalizeLeague } from './constants.js';
import { formatToolResult } from '../types.js';

const TopRedCardsInputSchema = z.object({
  league: z.string().describe('League name or code to fetch top red cards.'),
  season: z.string().describe('Season year in YYYY format.'),
});

export const getFootballTopRedCards = new DynamicStructuredTool({
  name: 'get_football_top_red_cards',
  description: 'Fetches players with the most red cards for a league season.',
  schema: TopRedCardsInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const leagueId = await resolveLeagueId(leagueName);
    const params = {
      league: leagueId,
      season: input.season,
    };
    const { data, url } = await callApi('/players/topredcards', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
    });
  },
});
