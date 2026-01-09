import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const SidelinedInputSchema = z.object({
  player_id: z.string().optional().describe('Player id to fetch sidelined history.'),
  coach_id: z.string().optional().describe('Coach id to fetch sidelined history.'),
});

export const getFootballSidelined = new DynamicStructuredTool({
  name: 'get_football_sidelined',
  description: 'Fetches sidelined history for a player or coach.',
  schema: SidelinedInputSchema,
  func: async (input) => {
    const params = {
      player: input.player_id,
      coach: input.coach_id,
    };
    const { data, url } = await callApi('/sidelined', params);
    return formatToolResult(data, [url], {
      playerId: input.player_id,
    });
  },
});
