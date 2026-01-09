import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const TeamsInputSchema = z.object({
  team_id: z.string().optional().describe('Team id to fetch a specific team.'),
  name: z.string().optional().describe('Exact team name to search.'),
  league: z.string().optional().describe('League name or code to filter teams.'),
  season: z.string().optional().describe('Season year in YYYY format.'),
  country: z.string().optional().describe('Country name to filter teams.'),
  code: z.string().optional().describe('Three-letter team code.'),
  venue_id: z.string().optional().describe('Venue id to filter teams.'),
  search: z.string().optional().describe('Search term for team name or country.'),
});

export const getFootballTeams = new DynamicStructuredTool({
  name: 'get_football_teams',
  description: 'Fetches team metadata and venue info.',
  schema: TeamsInputSchema,
  func: async (input) => {
    const leagueName = input.league ? normalizeLeague(input.league) : undefined;
    const leagueId = leagueName ? await resolveLeagueId(leagueName) : undefined;
    const normalizedName = input.name ? normalizeTeam(input.name) : undefined;
    const normalizedSearch = input.search ? normalizeTeam(input.search) : undefined;
    const params = {
      id: input.team_id,
      name: normalizedName,
      league: leagueId,
      season: input.season,
      country: input.country,
      code: input.code,
      venue: input.venue_id,
      search: normalizedSearch,
    };
    const { data, url } = await callApi('/teams', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      season: input.season,
    });
  },
});
