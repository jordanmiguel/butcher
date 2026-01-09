import {
  normalizeLeague,
  normalizeLeagueId,
  normalizeMarketType,
  normalizeTeam,
} from './constants.js';

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io';

const leagueCache = new Map<string, number>();
const teamCache = new Map<string, number>();
const betCache = new Map<string, number>();
const bookmakerCache = new Map<string, number>();

export interface ApiResponse {
  data: unknown;
  url: string;
  errors?: unknown;
  results?: number;
  paging?: Record<string, number>;
}

export async function callApi(
  endpoint: string,
  params: Record<string, string | number | string[] | undefined>
): Promise<ApiResponse> {
  const apiKey =
    process.env.API_FOOTBALL_API_KEY ||
    process.env.APISPORTS_API_KEY ||
    process.env.SPORTS_DATA_API_KEY;
  const baseUrl = process.env.API_FOOTBALL_BASE_URL || DEFAULT_BASE_URL;
  const url = new URL(`${baseUrl}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': apiKey || '',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return {
    data: payload.response ?? payload,
    url: url.toString(),
    errors: payload.errors,
    results: payload.results,
    paging: payload.paging,
  };
}

function buildCacheKey(parts: Array<string | number | undefined>): string {
  return parts.filter((part) => part !== undefined && part !== '').join(':');
}

export async function resolveLeagueId(league: string): Promise<number | undefined> {
  const numeric = normalizeLeagueId(league);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = normalizeLeague(league);
  const cacheKey = buildCacheKey(['league', normalized]);
  const cached = leagueCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const { data } = await callApi('/leagues', { search: normalized });
  const leagueId = Array.isArray(data) ? data[0]?.league?.id : undefined;
  if (leagueId) {
    leagueCache.set(cacheKey, leagueId);
  }
  return leagueId;
}

export async function resolveTeamId(
  team: string,
  leagueId?: number,
  season?: string | number
): Promise<number | undefined> {
  const normalized = normalizeTeam(team);
  const cacheKey = buildCacheKey(['team', normalized, leagueId, season]);
  const cached = teamCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const params: Record<string, string | number | undefined> = {
    search: normalized,
    league: leagueId,
    season,
  };
  const { data } = await callApi('/teams', params);
  const teamId = Array.isArray(data) ? data[0]?.team?.id : undefined;
  if (teamId) {
    teamCache.set(cacheKey, teamId);
  }
  return teamId;
}

export async function resolveBetId(market: string): Promise<number | undefined> {
  const trimmed = market.trim();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed !== '') {
    return numeric;
  }
  const normalized = normalizeMarketType(market);
  const cacheKey = buildCacheKey(['bet', normalized]);
  const cached = betCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const { data } = await callApi('/odds/bets', { search: normalized });
  const betId = Array.isArray(data) ? data[0]?.id : undefined;
  if (betId) {
    betCache.set(cacheKey, betId);
  }
  return betId;
}

export async function resolveBookmakerId(bookmaker: string): Promise<number | undefined> {
  const trimmed = bookmaker.trim();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed !== '') {
    return numeric;
  }
  const cacheKey = buildCacheKey(['bookmaker', bookmaker]);
  const cached = bookmakerCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const { data } = await callApi('/odds/bookmakers', { search: bookmaker });
  const bookmakerId = Array.isArray(data) ? data[0]?.id : undefined;
  if (bookmakerId) {
    bookmakerCache.set(cacheKey, bookmakerId);
  }
  return bookmakerId;
}
