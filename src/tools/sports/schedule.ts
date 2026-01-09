import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const MatchScheduleInputSchema = z.object({
  league: z.string().describe('League name or code, e.g. EPL, La Liga, or Serie A.'),
  fixture_id: z.string().optional().describe('Specific fixture id to fetch.'),
  fixture_ids: z
    .array(z.string())
    .optional()
    .describe('Multiple fixture ids to fetch (array will be joined for the API).'),
  live: z
    .string()
    .optional()
    .describe('Live filter: "all" or a dash-separated list of league ids.'),
  season: z.string().optional().describe('Season year in YYYY format, e.g. 2024.'),
  start_date: z.string().optional().describe('Start date in YYYY-MM-DD format.'),
  end_date: z.string().optional().describe('End date in YYYY-MM-DD format.'),
  date: z.string().optional().describe('Specific match date in YYYY-MM-DD format.'),
  round: z.string().optional().describe('League round (e.g. Regular Season - 1).'),
  status: z
    .string()
    .optional()
    .describe('Optional fixture status short code (e.g. NS, FT, PST).'),
  last: z.number().int().min(1).max(50).optional().describe('Return last X fixtures.'),
  next: z.number().int().min(1).max(50).optional().describe('Return next X fixtures.'),
  venue_id: z.string().optional().describe('Venue id to filter fixtures.'),
  timezone: z
    .string()
    .optional()
    .describe('Timezone identifier from the API timezone list.'),
  team: z
    .string()
    .optional()
    .describe('Optional team filter. Provide team name to limit the schedule.'),
});

export const getFootballMatchSchedule = new DynamicStructuredTool({
  name: 'get_football_match_schedule',
  description: 'Fetches upcoming and recent match schedules for football within a league.',
  schema: MatchScheduleInputSchema,
  func: async (input) => {
    const leagueName = normalizeLeague(input.league);
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const leagueId = await resolveLeagueId(leagueName);
    const teamId = teamName ? await resolveTeamId(teamName, leagueId, input.season) : undefined;
    const params = {
      id: input.fixture_id,
      ids: input.fixture_ids?.join('-'),
      live: input.live,
      league: leagueId,
      season: input.season,
      from: input.start_date,
      to: input.end_date,
      date: input.date,
      round: input.round,
      status: input.status,
      last: input.last,
      next: input.next,
      venue: input.venue_id,
      timezone: input.timezone,
      team: teamId,
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
