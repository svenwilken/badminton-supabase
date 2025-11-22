import { InsertPlayer, Player } from './supabase.types';
export interface ParsedImportData {
  [discipline: string]: InsertPlayer[][];
}

export interface PlayerMatchResult {
  isExactMatch: boolean;
  matchingPlayer: Player | null;
  mostSimilarPlayers: Player[];
}
export interface MatchedImportData {
  [discipline: string]: (InsertPlayer & { match: PlayerMatchResult })[][];
}
