import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const TrophiesInputSchema = z.object({
  player_id: z.string().optional().describe('Player id to fetch trophies.'),
  coach_id: z.string().optional().describe('Coach id to fetch trophies.'),
});

export const getFootballTrophies = new DynamicStructuredTool({
  name: 'get_football_trophies',
  description: 'Fetches trophies won by a player or coach.',
  schema: TrophiesInputSchema,
  func: async (input) => {
    const params = {
      player: input.player_id,
      coach: input.coach_id,
    };
    const { data, url } = await callApi('/trophies', params);
    return formatToolResult(data, [url], {
      playerId: input.player_id,
    });
  },
});
