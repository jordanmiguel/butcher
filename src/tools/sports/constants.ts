const LEAGUE_ID_ALIASES: Record<string, number> = {
  premier_league: 39,
  epl: 39,
  la_liga: 140,
  laliga: 140,
  serie_a: 135,
  seriea: 135,
  bundesliga: 78,
  ligue_1: 61,
  ligue1: 61,
  mls: 253,
  champions_league: 2,
  ucl: 2,
  europa_league: 3,
  uel: 3,
};

const LEAGUE_NAME_ALIASES: Record<string, string> = {
  premier_league: 'Premier League',
  epl: 'Premier League',
  la_liga: 'La Liga',
  laliga: 'La Liga',
  serie_a: 'Serie A',
  seriea: 'Serie A',
  bundesliga: 'Bundesliga',
  ligue_1: 'Ligue 1',
  ligue1: 'Ligue 1',
  mls: 'MLS',
  champions_league: 'UEFA Champions League',
  ucl: 'UEFA Champions League',
  europa_league: 'UEFA Europa League',
  uel: 'UEFA Europa League',
};

const MARKET_ALIASES: Record<string, string> = {
  match_winner: 'Match Winner',
  full_time_result: 'Match Winner',
  moneyline: 'Match Winner',
  '1x2': 'Match Winner',
  both_teams_to_score: 'Both Teams Score',
  btts: 'Both Teams Score',
  over_under: 'Goals Over/Under',
  totals: 'Goals Over/Under',
  ou: 'Goals Over/Under',
};

const TEAM_ALIASES: Record<string, string> = {
  manchester_united: 'Manchester United',
  man_utd: 'Manchester United',
  manchester_city: 'Manchester City',
  man_city: 'Manchester City',
  real_madrid: 'Real Madrid',
  barcelona: 'Barcelona',
  bayern_munich: 'Bayern Munich',
  psg: 'Paris Saint-Germain',
  paris_saint_germain: 'Paris Saint-Germain',
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '_');
}

export function normalizeLeague(value: string): string {
  const key = normalizeKey(value);
  return LEAGUE_NAME_ALIASES[key] || value;
}

export function normalizeLeagueId(value: string): number | undefined {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed !== '') {
    return numeric;
  }
  const key = normalizeKey(value);
  return LEAGUE_ID_ALIASES[key];
}

export function normalizeMarketType(value: string): string {
  const key = normalizeKey(value);
  return MARKET_ALIASES[key] || value;
}

export function normalizeTeam(value: string): string {
  const key = normalizeKey(value);
  return TEAM_ALIASES[key] || value;
}
