import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi, resolveLeagueId, resolveTeamId } from './api.js';
import { normalizeLeague, normalizeTeam } from './constants.js';
import { formatToolResult } from '../types.js';

const PlayersInputSchema = z.object({
  player_id: z.string().optional().describe('Player id to fetch a specific player.'),
  team: z.string().optional().describe('Team name to filter players.'),
  league: z.string().optional().describe('League name or code to filter players.'),
  season: z.string().optional().describe('Season year in YYYY format.'),
  search: z.string().optional().describe('Search term for player name.'),
  page: z.number().int().min(1).max(20).optional().describe('Pagination page number.'),
});

export const getFootballPlayers = new DynamicStructuredTool({
  name: 'get_football_players',
  description: 'Fetches player profiles and season statistics.',
  schema: PlayersInputSchema,
  func: async (input) => {
    const leagueName = input.league ? normalizeLeague(input.league) : undefined;
    const leagueId = leagueName ? await resolveLeagueId(leagueName) : undefined;
    const teamName = input.team ? normalizeTeam(input.team) : undefined;
    const teamId = teamName ? await resolveTeamId(teamName, leagueId, input.season) : undefined;
    const params = {
      id: input.player_id,
      team: teamId,
      league: leagueId,
      season: input.season,
      search: input.search,
      page: input.page,
    };
    const { data, url } = await callApi('/players', params);
    return formatToolResult(data, [url], {
      league: leagueName,
      leagueId,
      team: teamName,
      teamId,
      season: input.season,
      playerId: input.player_id,
    });
  },
});
