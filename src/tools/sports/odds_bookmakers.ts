import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const OddsBookmakersInputSchema = z.object({
  bookmaker_id: z.string().optional().describe('Bookmaker id to fetch a specific bookmaker.'),
  search: z.string().optional().describe('Search term for bookmaker name.'),
});

export const getFootballOddsBookmakers = new DynamicStructuredTool({
  name: 'get_football_odds_bookmakers',
  description: 'Fetches available bookmakers for pre-match odds.',
  schema: OddsBookmakersInputSchema,
  func: async (input) => {
    const params = {
      id: input.bookmaker_id,
      search: input.search,
    };
    const { data, url } = await callApi('/odds/bookmakers', params);
    return formatToolResult(data, [url], {
      bookmakerId:
        input.bookmaker_id && !Number.isNaN(Number(input.bookmaker_id))
          ? Number(input.bookmaker_id)
          : undefined,
    });
  },
});
