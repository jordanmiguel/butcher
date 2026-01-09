import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const TeamStatsInputSchema = z.object({
  team: z.string().describe('Team name to fetch aggregated statistics for.'),
  league: z.string().describe('League name or code for the team.'),
  season: z.string().describe('Season year in YYYY format, e.g. 2024.'),
  date: z.string().optional().describe('Optional cutoff date in YYYY-MM-DD format.'),
  timezone: z.string().optional().describe('Timezone identifier from the API timezone list.'),
});

export const getFootballTeamStats = new DynamicStructuredTool({
  name: 'get_football_team_stats',
  description: 'Fetches aggregated team statistics for a football team in a league.',
  schema: TeamStatsInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const teamName = normalizeTeam(input.team);
    const leagueId = await resolveLeagueId(leagueName);
    const teamId = await resolveTeamId(teamName, leagueId, input.season);
    const params = {
      team: teamId,
      league: leagueId,
      season: input.season,
      date: input.date,
      timezone: input.timezone,
    };
    const { data, url } = await callApi('/teams/statistics', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      team: teamName,
      teamId,
      season: input.season,
    });
  },
});
