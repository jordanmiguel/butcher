import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const RecentFormInputSchema = z.object({
  team: z.string().describe('Team name to fetch recent form for.'),
  league: z.string().describe('League name or code for the team.'),
  season: z.string().optional().describe('Season year in YYYY format, e.g. 2024.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe('Number of recent matches to include. Defaults to 5.'),
  status: z
    .string()
    .optional()
    .describe('Optional fixture status short code (e.g. FT, PST).'),
  timezone: z.string().optional().describe('Timezone identifier from the API timezone list.'),
});

export const getFootballRecentForm = new DynamicStructuredTool({
  name: 'get_football_recent_form',
  description: 'Fetches recent match results to summarize current team form.',
  schema: RecentFormInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const teamName = normalizeTeam(input.team);
    const leagueId = await resolveLeagueId(leagueName);
    const teamId = await resolveTeamId(teamName, leagueId, input.season);
    const params = {
      team: teamId,
      league: leagueId,
      season: input.season,
      last: input.limit,
      status: input.status,
      timezone: input.timezone,
    };
    const { data, url } = await callApi('/fixtures', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      team: teamName,
      teamId,
      season: input.season,
    });
  },
});
