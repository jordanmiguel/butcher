import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const OddsBetsInputSchema = z.object({
  bet_id: z.string().optional().describe('Bet id to fetch a specific market.'),
  search: z.string().optional().describe('Search term for a bet market name.'),
  market: z
    .string()
    .optional()
    .describe('Market name to search (e.g. 1X2, Over/Under, BTTS, Corners, Cards).'),
});

export const getFootballOddsBets = new DynamicStructuredTool({
  name: 'get_football_odds_bets',
  description:
    'Fetches available pre-match odds markets, including 1X2, Over/Under, BTTS, Corners, and Cards.',
  schema: OddsBetsInputSchema,
  func: async (input) => {
    const marketSearch = input.market && !input.search ? input.market : input.search;
    const betId =
      input.bet_id && !Number.isNaN(Number(input.bet_id)) ? Number(input.bet_id) : undefined;
    const params = {
      id: input.bet_id,
      search: marketSearch,
    };
    const { data, url } = await callApi('/odds/bets', params);
    return formatToolResult(data, [url], { betId });
  },
});
