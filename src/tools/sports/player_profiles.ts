import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const PlayerProfilesInputSchema = z.object({
  player_id: z.string().optional().describe('Player id to fetch a specific profile.'),
  search: z.string().optional().describe('Search term for player last name.'),
  page: z.number().int().min(1).max(20).optional().describe('Pagination page number.'),
});

export const getFootballPlayerProfiles = new DynamicStructuredTool({
  name: 'get_football_player_profiles',
  description: 'Fetches player profile data (bio, position, jersey number).',
  schema: PlayerProfilesInputSchema,
  func: async (input) => {
    const params = {
      player: input.player_id,
      search: input.search,
      page: input.page,
    };
    const { data, url } = await callApi('/players/profiles', params);
    return formatToolResult(data, [url], {
      playerId: input.player_id,
    });
  },
});
