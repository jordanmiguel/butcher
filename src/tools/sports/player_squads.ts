import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const PlayerSquadsInputSchema = z.object({
  team: z.string().describe('Team name to fetch the current squad.'),
});

export const getFootballPlayerSquads = new DynamicStructuredTool({
  name: 'get_football_player_squads',
  description: 'Fetches squad lists for a specific team.',
  schema: PlayerSquadsInputSchema,
  func: async (input) => {
    const teamName = normalizeTeam(input.team);
    const teamId = await resolveTeamId(teamName);
    const params = {
      team: teamId,
    };
    const { data, url } = await callApi('/players/squads', params);
    return formatToolResult(data, [url], {
      team: teamName,
      teamId,
    });
  },
});
