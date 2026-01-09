import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const OddsBetsInputSchema = z.object({
  bet_id: z.string().optional().describe('Bet id to fetch a specific market.'),
  search: z.string().optional().describe('Search term for a bet market name.'),
});

export const getFootballOddsBets = new DynamicStructuredTool({
  name: 'get_football_odds_bets',
  description: 'Fetches available bet markets for pre-match odds.',
  schema: OddsBetsInputSchema,
  func: async (input) => {
    const betId =
      input.bet_id && !Number.isNaN(Number(input.bet_id)) ? Number(input.bet_id) : undefined;
    const params = {
      id: input.bet_id,
      search: input.search,
    };
    const { data, url } = await callApi('/odds/bets', params);
    return formatToolResult(data, [url], { betId });
  },
});
