import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment';
import { Gender, DisciplineGender } from '../models/types';
import { Database } from '../models/database.types';

export type Tournament = Database['public']['Tables']['tournament']['Row'];

export type Player = Database['public']['Tables']['player']['Row'];
export type InsertPlayer = Database['public']['Tables']['player']['Insert'];

// Utility function to get full player name
export function getPlayerFullName(player: Player | null | undefined): string {
  if (!player) return '';
  const firstname = player.firstname.trim();
  const lastname = player.lastname.trim();
  return `${firstname} ${lastname}`.trim();
}

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

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
  }

  // Tournament operations
  async getTournaments() {
    const { data, error } = await this.supabase
      .from('tournament')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createTournament(name: string) {
    const { data, error } = await this.supabase
      .from('tournament')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return data as Tournament;
  }

  async deleteTournament(id: string) {
    const { error } = await this.supabase.from('tournament').delete().eq('id', id);

    if (error) throw error;
  }

  // Player operations
  async getPlayers() {
    const { data, error } = await this.supabase
      .from('player')
      .select('*')
      .order('lastname', { ascending: true })
      .order('firstname', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createPlayer(player: {
    firstname: string;
    lastname: string;
    gender: Gender;
    club?: string | null;
  }) {
    const { data, error } = await this.supabase.from('player').insert(player).select().single();

    if (error) throw error;
    return data;
  }

  async updatePlayer(
    id: string,
    player: { firstname: string; lastname: string; gender: Gender; club?: string | null },
  ) {
    const { data, error } = await this.supabase
      .from('player')
      .update(player)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDistinctClubs(): Promise<string[]> {
    const { data, error } = await this.supabase.rpc('get_distinct_clubs');

    if (error) throw error;
    return data.map(({ club }) => club);
  }

  async deletePlayer(id: string) {
    const { error } = await this.supabase.from('player').delete().eq('id', id);

    if (error) throw error;
  }

  // Discipline operations
  async getDisciplinesByTournament(tournamentId: string) {
    const { data, error } = await this.supabase
      .from('discipline')
      .select(
        `
        *,
        singles_player:singles_player!discipline_id(count),
        doubles_pair:doubles_pair!discipline(count)
      `,
      )
      .eq('tournament', tournamentId)
      .order('is_doubles')
      .order('name');

    if (error) throw error;

    // Add participants_count based on discipline type
    return (
      data?.map((discipline) => ({
        ...discipline,
        participants_count: discipline.is_doubles
          ? discipline.doubles_pair?.[0]?.count || 0
          : discipline.singles_player?.[0]?.count || 0,
      })) || []
    );
  }

  async getDisciplineById(disciplineId: string) {
    const { data, error } = await this.supabase
      .from('discipline')
      .select(
        `
        *,
        singles_player:singles_player!discipline_id(count),
        doubles_pair:doubles_pair!discipline(count)
      `,
      )
      .eq('id', disciplineId)
      .single();

    if (error) throw error;

    // Add participants_count based on discipline type
    return {
      ...data,
      participants_count: data.is_doubles
        ? data.doubles_pair?.[0]?.count || 0
        : data.singles_player?.[0]?.count || 0,
    };
  }

  async createDiscipline(discipline: {
    name: string;
    is_doubles: boolean;
    gender: DisciplineGender;
    charge: number | null;
    tournament: string;
  }) {
    const { data, error } = await this.supabase
      .from('discipline')
      .insert({
        name: discipline.name,
        is_doubles: discipline.is_doubles,
        gender: discipline.gender,
        charge: discipline.charge,
        tournament: discipline.tournament,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDiscipline(id: string) {
    const { error } = await this.supabase.from('discipline').delete().eq('id', id);

    if (error) throw error;
  }

  // Participants operations
  async getSinglesParticipants(disciplineId: string): Promise<SinglesParticipant[]> {
    const { data, error } = await this.supabase
      .from('singles_player')
      .select(
        `
        *,
        player:player_id (*)
      `,
      )
      .eq('discipline_id', disciplineId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as SinglesParticipant[];
  }

  async getDoublesParticipants(disciplineId: string): Promise<DoublesParticipant[]> {
    const { data, error } = await this.supabase
      .from('doubles_pair')
      .select(
        `
        *,
        player_1_details:player!doubles_pair_player_1_fkey (*),
        player_2_details:player!doubles_pair_player_2_fkey (*)
      `,
      )
      .eq('discipline', disciplineId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as DoublesParticipant[];
  }

  async deleteSinglesParticipant(disciplineId: string, playerId: string) {
    const { error } = await this.supabase
      .from('singles_player')
      .delete()
      .eq('discipline_id', disciplineId)
      .eq('player_id', playerId);

    if (error) throw error;
  }

  async deleteDoublesParticipant(id: string) {
    const { error } = await this.supabase.from('doubles_pair').delete().eq('id', id);

    if (error) throw error;
  }

  async addSinglesParticipant(disciplineId: string, playerId: string) {
    const { error } = await this.supabase.from('singles_player').insert({
      discipline_id: disciplineId,
      player_id: playerId,
    });

    if (error) throw error;
  }

  async addDoublesParticipant(disciplineId: string, player1Id: string, player2Id: string) {
    const { error } = await this.supabase.from('doubles_pair').insert({
      discipline: disciplineId,
      player_1: player1Id,
      player_2: player2Id,
    });

    if (error) throw error;
  }

  async updateSinglesParticipant(disciplineId: string, oldPlayerId: string, newPlayerId: string) {
    const { error } = await this.supabase
      .from('singles_player')
      .update({ player_id: newPlayerId })
      .eq('discipline_id', disciplineId)
      .eq('player_id', oldPlayerId);

    if (error) throw error;
  }

  async updateDoublesParticipant(pairId: string, player1Id: string, player2Id: string) {
    const { error } = await this.supabase
      .from('doubles_pair')
      .update({
        player_1: player1Id,
        player_2: player2Id,
      })
      .eq('id', pairId);

    if (error) throw error;
  }
}
