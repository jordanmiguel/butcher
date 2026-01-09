import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId } from './api.js';
import { normalizeLeague } from './constants.js';
import { formatToolResult } from '../types.js';

const TopAssistsInputSchema = z.object({
  league: z.string().describe('League name or code to fetch top assists.'),
  season: z.string().describe('Season year in YYYY format.'),
});

export const getFootballTopAssists = new DynamicStructuredTool({
  name: 'get_football_top_assists',
  description: 'Fetches top assist providers for a league season.',
  schema: TopAssistsInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const leagueId = await resolveLeagueId(leagueName);
    const params = {
      league: leagueId,
      season: input.season,
    };
    const { data, url } = await callApi('/players/topassists', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
    });
  },
});
