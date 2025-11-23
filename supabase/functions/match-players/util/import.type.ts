import { Player } from "./supabase.types.ts";

export interface PlayerMatchResult {
  isExactMatch: boolean;
  matchingPlayer: Player | null;
  mostSimilarPlayers: { player: Player; score: number }[];
}
