import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const FixtureStatsInputSchema = z.object({
  fixture_id: z.string().describe('Fixture identifier to fetch statistics for.'),
  team: z
    .string()
    .optional()
    .describe('Optional team name to filter statistics to a single team.'),
});

export const getFootballFixtureStatistics = new DynamicStructuredTool({
  name: 'get_football_fixture_statistics',
  description:
    'Fetches match statistics for a specific fixture (possession, shots, corners, cards, etc.).',
  schema: FixtureStatsInputSchema,
  func: async (input) => {
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName) : undefined;
    const params = {
      fixture: input.fixture_id,
      team: teamId,
    };
    const { data, url } = await callApi('/fixtures/statistics', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      team: teamName,
      teamId,
    });
  },
});
