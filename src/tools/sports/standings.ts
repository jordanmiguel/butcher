import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const StandingsInputSchema = z.object({
  league: z.string().describe('League name or code, e.g. EPL or La Liga.'),
  season: z.string().describe('Season year in YYYY format, e.g. 2024.'),
  team: z.string().optional().describe('Optional team name to filter standings.'),
});

export const getFootballStandings = new DynamicStructuredTool({
  name: 'get_football_standings',
  description: 'Fetches league standings for a given season.',
  schema: StandingsInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const leagueId = await resolveLeagueId(leagueName);
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName, leagueId, input.season) : undefined;
    const params = {
      league: leagueId,
      season: input.season,
      team: teamId,
    };
    const { data, url } = await callApi('/standings', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
      team: teamName,
      teamId,
    });
  },
});
