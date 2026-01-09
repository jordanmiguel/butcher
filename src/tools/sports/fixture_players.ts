import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const FixturePlayersInputSchema = z.object({
  fixture_id: z.string().describe('Fixture identifier to fetch player stats for.'),
  team: z
    .string()
    .optional()
    .describe('Optional team name to filter player stats for a specific team.'),
});

export const getFootballFixturePlayers = new DynamicStructuredTool({
  name: 'get_football_fixture_players',
  description: 'Fetches player statistics for a fixture (minutes, shots, passes, ratings).',
  schema: FixturePlayersInputSchema,
  func: async (input) => {
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName) : undefined;
    const params = {
      fixture: input.fixture_id,
      team: teamId,
    };
    const { data, url } = await callApi('/fixtures/players', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      team: teamName,
      teamId,
    });
  },
});
