import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredToolInterface } from '@langchain/core/tools';
import { Runnable } from '@langchain/core/runnables';
import { z } from 'zod';
import { DEFAULT_SYSTEM_PROMPT } from '../agent/prompts.js';

export const DEFAULT_PROVIDER = 'openai';
export const DEFAULT_MODEL = 'gpt-5.2';
export const DEFAULT_MAX_PROMPT_TOKENS = 6000;

export function estimateTokenCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.ceil(trimmed.length / 4);
}

function trimPromptToBudget(prompt: string, maxTokens: number): string {
  if (estimateTokenCount(prompt) <= maxTokens) {
    return prompt;
  }

  const lines = prompt.split('\n');
  while (lines.length > 1 && estimateTokenCount(lines.join('\n')) > maxTokens) {
    lines.shift();
  }

  let trimmed = lines.join('\n').trimStart();
  if (estimateTokenCount(trimmed) > maxTokens) {
    const maxChars = Math.max(maxTokens * 4, 0);
    trimmed = trimmed.slice(-maxChars);
  }

  return trimmed;
}

// Generic retry helper with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxAttempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw new Error('Unreachable');
}

// Model provider configuration
interface ModelOpts {
  streaming: boolean;
}

type ModelFactory = (name: string, opts: ModelOpts) => BaseChatModel;

function getApiKey(envVar: string, providerName: string): string {
  const apiKey = process.env[envVar];
  if (!apiKey) {
    throw new Error(`${envVar} not found in environment variables`);
  }
  return apiKey;
}

const MODEL_PROVIDERS: Record<string, ModelFactory> = {
  'claude-': (name, opts) =>
    new ChatAnthropic({
      model: name,
      ...opts,
      apiKey: getApiKey('ANTHROPIC_API_KEY', 'Anthropic'),
    }),
  'gemini-': (name, opts) =>
    new ChatGoogleGenerativeAI({
      model: name,
      ...opts,
      apiKey: getApiKey('GOOGLE_API_KEY', 'Google'),
    }),
  'ollama:': (name, opts) =>
    new ChatOllama({
      model: name.replace(/^ollama:/, ''),
      ...opts,
      ...(process.env.OLLAMA_BASE_URL ? { baseUrl: process.env.OLLAMA_BASE_URL } : {}),
    }),
};

const ZAI_MODELS = new Set(['glm-4.7']);

const ZAI_MODEL_FACTORY: ModelFactory = (name, opts) =>
  new ChatOpenAI({
    model: name,
    ...opts,
    apiKey: getApiKey('ZAI_API_KEY', 'Z.AI'),
    baseURL: process.env.ZAI_BASE_URL ?? 'https://api.z.ai/api/paas/v4',
  });

const DEFAULT_MODEL_FACTORY: ModelFactory = (name, opts) =>
  new ChatOpenAI({
    model: name,
    ...opts,
    apiKey: process.env.OPENAI_API_KEY,
  });

export function getChatModel(
  modelName: string = DEFAULT_MODEL,
  streaming: boolean = false
): BaseChatModel {
  const opts: ModelOpts = { streaming };
  if (ZAI_MODELS.has(modelName)) {
    return ZAI_MODEL_FACTORY(modelName, opts);
  }
  const prefix = Object.keys(MODEL_PROVIDERS).find((p) => modelName.startsWith(p));
  const factory = prefix ? MODEL_PROVIDERS[prefix] : DEFAULT_MODEL_FACTORY;
  return factory(modelName, opts);
}

interface CallLlmOptions {
  model?: string;
  systemPrompt?: string;
  outputSchema?: z.ZodType<unknown>;
  tools?: StructuredToolInterface[];
  maxPromptTokens?: number;
}

export async function callLlm(prompt: string, options: CallLlmOptions = {}): Promise<unknown> {
  const {
    model = DEFAULT_MODEL,
    systemPrompt,
    outputSchema,
    tools,
    maxPromptTokens = DEFAULT_MAX_PROMPT_TOKENS,
  } = options;
  const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const systemTokens = estimateTokenCount(finalSystemPrompt);
  const budgetForUserPrompt = Math.max(maxPromptTokens - systemTokens, 0);
  const trimmedPrompt = trimPromptToBudget(prompt, budgetForUserPrompt);

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', finalSystemPrompt],
    ['user', '{prompt}'],
  ]);

  const llm = getChatModel(model, false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let runnable: Runnable<any, any> = llm;

  if (outputSchema) {
    runnable = llm.withStructuredOutput(outputSchema);
  } else if (tools && tools.length > 0 && llm.bindTools) {
    runnable = llm.bindTools(tools);
  }

  const chain = promptTemplate.pipe(runnable);

  const result = await withRetry(() => chain.invoke({ prompt: trimmedPrompt }));

  // If no outputSchema and no tools, extract content from AIMessage
  // When tools are provided, return the full AIMessage to preserve tool_calls
  if (!outputSchema && !tools && result && typeof result === 'object' && 'content' in result) {
    return (result as { content: string }).content;
  }
  return result;
}

export async function* callLlmStream(
  prompt: string,
  options: { model?: string; systemPrompt?: string; maxPromptTokens?: number } = {}
): AsyncGenerator<string> {
  const {
    model = DEFAULT_MODEL,
    systemPrompt,
    maxPromptTokens = DEFAULT_MAX_PROMPT_TOKENS,
  } = options;
  const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const systemTokens = estimateTokenCount(finalSystemPrompt);
  const budgetForUserPrompt = Math.max(maxPromptTokens - systemTokens, 0);
  const trimmedPrompt = trimPromptToBudget(prompt, budgetForUserPrompt);

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', finalSystemPrompt],
    ['user', '{prompt}'],
  ]);

  const llm = getChatModel(model, true);
  const chain = promptTemplate.pipe(llm);

  // For streaming, we handle retry at the connection level
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const stream = await chain.stream({ prompt: trimmedPrompt });

      for await (const chunk of stream) {
        if (chunk && typeof chunk === 'object' && 'content' in chunk) {
          const content = chunk.content;
          if (content && typeof content === 'string') {
            yield content;
          }
        }
      }
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}
