import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const FixtureLineupsInputSchema = z.object({
  fixture_id: z.string().describe('Fixture identifier to fetch lineups for.'),
  team: z
    .string()
    .optional()
    .describe('Optional team name to filter lineups for a specific team.'),
  player_id: z.string().optional().describe('Optional player id to filter lineups.'),
});

export const getFootballFixtureLineups = new DynamicStructuredTool({
  name: 'get_football_fixture_lineups',
  description: 'Fetches starting lineups, formations, and coaches for a fixture.',
  schema: FixtureLineupsInputSchema,
  func: async (input) => {
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName) : undefined;
    const params = {
      fixture: input.fixture_id,
      team: teamId,
      player: input.player_id,
    };
    const { data, url } = await callApi('/fixtures/lineups', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      team: teamName,
      teamId,
      playerId: input.player_id,
    });
  },
});
