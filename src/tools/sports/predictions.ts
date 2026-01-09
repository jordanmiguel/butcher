import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callApi } from './api.js';
import { formatToolResult } from '../types.js';

const PredictionsInputSchema = z.object({
  fixture_id: z.string().describe('Fixture identifier to fetch predictions for.'),
});

export const getFootballPredictions = new DynamicStructuredTool({
  name: 'get_football_predictions',
  description: 'Fetches prediction insights for a fixture (model outputs, probabilities, advice).',
  schema: PredictionsInputSchema,
  func: async (input) => {
    const params = {
      fixture: input.fixture_id,
    };
    const { data, url } = await callApi('/predictions', params);
    return formatToolResult(data, [url], {
      fixtureId: input.fixture_id,
    });
  },
});
