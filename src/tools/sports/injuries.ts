import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const InjuriesInputSchema = z.object({
  fixture_id: z.string().optional().describe('Fixture id to fetch injury list for.'),
  league: z.string().optional().describe('League name or code to filter injuries.'),
  season: z.string().optional().describe('Season year in YYYY format, e.g. 2024.'),
  team: z.string().optional().describe('Team name to filter injuries.'),
  player_id: z.string().optional().describe('Player id to filter injuries.'),
  ids: z
    .array(z.string())
    .optional()
    .describe('Multiple fixture ids to fetch injuries for.'),
});

export const getFootballInjuries = new DynamicStructuredTool({
  name: 'get_football_injuries',
  description: 'Fetches injury reports for fixtures, teams, or leagues.',
  schema: InjuriesInputSchema,
  func: async (input) => {
    const leagueName = input.league ? normalizeLeague(input.league) : undefined;
    const leagueId = leagueName ? await resolveLeagueId(leagueName) : undefined;
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName, leagueId, input.season) : undefined;
    const params = {
      fixture: input.fixture_id,
      ids: input.ids?.join('-'),
      league: leagueId,
      season: input.season,
      team: teamId,
      player: input.player_id,
    };
    const { data, url } = await callApi('/injuries', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
      league: leagueName,
      leagueId,
      team: teamName,
      teamId,
      season: input.season,
      playerId: input.player_id,
    });
  },
});
