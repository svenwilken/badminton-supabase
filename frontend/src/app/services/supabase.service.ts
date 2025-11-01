import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment';
import { Gender } from '../models/types';
import { Database } from '../models/database.types';

export type Tournament = Database['public']['Tables']['tournament']['Row'];
export type Player = Database['public']['Tables']['player']['Row'];
export type Discipline = Database['public']['Tables']['discipline']['Row'];

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseKey
    );
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
    const { error } = await this.supabase
      .from('tournament')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Player operations
  async getPlayers() {
    const { data, error } = await this.supabase
      .from('player')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createPlayer(player: { name: string; gender: Gender; club?: string | null }) {
    const { data, error } = await this.supabase
      .from('player')
      .insert(player)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePlayer(id: string, player: { name: string; gender: Gender; club?: string | null }) {
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
    const { data, error } = await this.supabase
      .rpc('get_distinct_clubs');
    
    if (error) throw error;
    return data.map(({ club }) => club);
  }

  async deletePlayer(id: string) {
    const { error } = await this.supabase
      .from('player')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Discipline operations
  async getDisciplinesByTournament(tournamentId: string) {
    const { data, error } = await this.supabase
      .from('discipline')
      .select('*')
      .eq('tournament', tournamentId);
    
    if (error) throw error;
    return data;
  }
}

