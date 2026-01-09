import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveTeamId } from './api.js';
import { normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const FixtureEventsInputSchema = z.object({
  fixture_id: z.string().describe('Fixture identifier to fetch events for.'),
  team: z
    .string()
    .optional()
    .describe('Optional team name to filter events for a specific team.'),
});

export const getFootballFixtureEvents = new DynamicStructuredTool({
  name: 'get_football_fixture_events',
  description: 'Fetches fixture events (goals, cards, substitutions) for a match.',
  schema: FixtureEventsInputSchema,
  func: async (input) => {
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName) : undefined;
    const params = {
      fixture: input.fixture_id,
      team: teamId,
    };
    const { data, url } = await callApi('/fixtures/events', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      team: teamName,
      teamId,
    });
  },
});
