import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const TransfersInputSchema = z.object({
  team: z.string().optional().describe('Team name to fetch transfers.'),
  player_id: z.string().optional().describe('Player id to fetch transfers.'),
});

export const getFootballTransfers = new DynamicStructuredTool({
  name: 'get_football_transfers',
  description: 'Fetches player transfer history for a team or player.',
  schema: TransfersInputSchema,
  func: async (input) => {
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName) : undefined;
    const params = {
      team: teamId,
      player: input.player_id,
    };
    const { data, url } = await callApi('/transfers', params);
    return formatToolResult(data, [url], {
      team: teamName,
      teamId,
      playerId: input.player_id,
    });
  },
});
