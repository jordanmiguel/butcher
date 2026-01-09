import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const OddsMappingInputSchema = z.object({
  page: z.number().int().min(1).max(20).optional().describe('Pagination page number.'),
});

export const getFootballOddsMapping = new DynamicStructuredTool({
  name: 'get_football_odds_mapping',
  description: 'Fetches fixtures that have available pre-match odds data.',
  schema: OddsMappingInputSchema,
  func: async (input) => {
    const params = {
      page: input.page,
    };
    const { data, url } = await callApi('/odds/mapping', params);
    return formatToolResult(data, [url]);
  },
});
