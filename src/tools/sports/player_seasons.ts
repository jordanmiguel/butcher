import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const PlayerSeasonsInputSchema = z.object({
  player_id: z.string().optional().describe('Optional player id to filter seasons.'),
});

export const getFootballPlayerSeasons = new DynamicStructuredTool({
  name: 'get_football_player_seasons',
  description: 'Fetches available seasons for player statistics.',
  schema: PlayerSeasonsInputSchema,
  func: async (input) => {
    const params = {
      player: input.player_id,
    };
    const { data, url } = await callApi('/players/seasons', params);
    return formatToolResult(data, [url], {
      playerId: input.player_id,
    });
  },
});
