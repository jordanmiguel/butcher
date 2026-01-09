import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const LeaguesInputSchema = z.object({
  season: z.string().optional().describe('Season year in YYYY format.'),
  country: z.string().optional().describe('Country name to filter leagues.'),
  team_id: z.string().optional().describe('Team id to filter leagues.'),
  type: z.string().optional().describe('League type (league or cup).'),
  current: z.string().optional().describe('Whether the league is currently active.'),
  search: z.string().optional().describe('Search term for league or country name.'),
  last: z.number().int().min(1).max(50).optional().describe('Return last X leagues/cups.'),
});

export const getFootballLeagues = new DynamicStructuredTool({
  name: 'get_football_leagues',
  description: 'Fetches league and cup metadata, including coverage and seasons.',
  schema: LeaguesInputSchema,
  func: async (input) => {
    const params = {
      season: input.season,
      country: input.country,
      team: input.team_id,
      type: input.type,
      current: input.current,
      search: input.search,
      last: input.last,
    };
    const { data, url } = await callApi('/leagues', params);
    return formatToolResult(data, [url], { season: input.season });
  },
});
