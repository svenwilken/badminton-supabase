import { InsertPlayer } from "./supabase.types";

export function getPlayerKey(player: InsertPlayer) {
  return [player.firstname, player.lastname, player.club ?? ""].join(";");
}

export function getFullName(player: InsertPlayer) {
  return `${player.firstname} ${player.lastname}`;
}
