import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId } from './api.js';
import { normalizeLeague } from './constants.js';
import { formatToolResult } from '../types.js';

const TopScorersInputSchema = z.object({
  league: z.string().describe('League name or code to fetch top scorers.'),
  season: z.string().describe('Season year in YYYY format.'),
});

export const getFootballTopScorers = new DynamicStructuredTool({
  name: 'get_football_top_scorers',
  description: 'Fetches top goal scorers for a league season.',
  schema: TopScorersInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const leagueId = await resolveLeagueId(leagueName);
    const params = {
      league: leagueId,
      season: input.season,
    };
    const { data, url } = await callApi('/players/topscorers', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
    });
  },
});
