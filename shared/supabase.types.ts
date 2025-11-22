import { Database } from './database.types';

export type Player = Database['public']['Tables']['player']['Row'];
export type InsertPlayer = Database['public']['Tables']['player']['Insert'];

export type Tournament = Database['public']['Tables']['tournament']['Row'];

export type Discipline = Database['public']['Tables']['discipline']['Row'] & {
  participants_count?: number;
};
export type SinglesPlayer = Database['public']['Tables']['singles_player']['Row'];
export type DoublesPair = Database['public']['Tables']['doubles_pair']['Row'];

// Extended types with player details
export interface SinglesParticipant extends SinglesPlayer {
  player: Player;
}

export interface DoublesParticipant extends DoublesPair {
  player_1_details: Player;
  player_2_details: Player;
}
