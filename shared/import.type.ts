import { InsertPlayer, Player } from './supabase.types';
export interface ParsedImportData {
  [discipline: string]: InsertPlayer[][];
}

export interface PlayerMatchResult {
  isExactMatch: boolean;
  matchingPlayer: Player | null;
  mostSimilarPlayers: { player: Player; score: number }[];
}
export interface MatchedImportData {
  [discipline: string]: (InsertPlayer & { match: PlayerMatchResult })[][];
}
