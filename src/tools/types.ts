export interface ToolResultMeta {
  matchId?: string;
  fixtureId?: string;
  league?: string;
  leagueId?: number;
  market?: string;
  betId?: number;
  bookmaker?: string;
  bookmakerId?: number;
  team?: string;
  teamId?: number | string;
  season?: string;
  playerId?: string;
}

export interface ToolResult {
  data: unknown;
  sourceUrls?: string[];
  meta?: ToolResultMeta;
}

export function formatToolResult(
  data: unknown,
  sourceUrls?: string[],
  meta?: ToolResultMeta
): string {
  const result: ToolResult = { data };
  if (sourceUrls?.length) {
    result.sourceUrls = sourceUrls;
  }
  if (meta && Object.keys(meta).length > 0) {
    result.meta = meta;
  }
  return JSON.stringify(result);
}
