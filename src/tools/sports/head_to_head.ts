import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const HeadToHeadInputSchema = z.object({
  home_team: z.string().describe('Home team name for the head-to-head lookup.'),
  away_team: z.string().describe('Away team name for the head-to-head lookup.'),
  league: z.string().optional().describe('League name or code to filter the h2h results.'),
  season: z.string().optional().describe('Season year in YYYY format, e.g. 2024.'),
  date: z.string().optional().describe('Filter fixtures by a specific date YYYY-MM-DD.'),
  last: z.number().int().min(1).max(50).optional().describe('Return last X fixtures.'),
  next: z.number().int().min(1).max(50).optional().describe('Return next X fixtures.'),
  start_date: z.string().optional().describe('Start date in YYYY-MM-DD format.'),
  end_date: z.string().optional().describe('End date in YYYY-MM-DD format.'),
  status: z
    .string()
    .optional()
    .describe('Optional fixture status short code (e.g. NS, FT, PST).'),
  timezone: z.string().optional().describe('Timezone identifier from the API timezone list.'),
});

export const getFootballHeadToHead = new DynamicStructuredTool({
  name: 'get_football_head_to_head',
  description: 'Fetches head-to-head fixtures between two teams, including recent results.',
  schema: HeadToHeadInputSchema,
  func: async (input) => {
    const homeName = normalizeTeam(input.home_team);
    const awayName = normalizeTeam(input.away_team);
    const leagueName = input.league ? normalizeLeague(input.league) : undefined;
    const leagueId = leagueName ? await resolveLeagueId(leagueName) : undefined;
    const homeId = await resolveTeamId(homeName, leagueId, input.season);
    const awayId = await resolveTeamId(awayName, leagueId, input.season);
    const params = {
      h2h: homeId && awayId ? `${homeId}-${awayId}` : undefined,
      league: leagueId,
      season: input.season,
      date: input.date,
      last: input.last,
      next: input.next,
      from: input.start_date,
      to: input.end_date,
      status: input.status,
      timezone: input.timezone,
    };
    const { data, url } = await callApi('/fixtures/headtohead', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      team: `${homeName} vs ${awayName}`,
      teamId: homeId && awayId ? `${homeId}-${awayId}` : undefined,
      season: input.season,
    });
  },
});
