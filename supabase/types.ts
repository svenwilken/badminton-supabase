export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      base_match: {
        Row: {
          created_at: string
          discipline: string
          finished_at: string | null
          id: string
          sets: Json | null
          started_at: string | null
        }
        Insert: {
          created_at?: string
          discipline: string
          finished_at?: string | null
          id?: string
          sets?: Json | null
          started_at?: string | null
        }
        Update: {
          created_at?: string
          discipline?: string
          finished_at?: string | null
          id?: string
          sets?: Json | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "base_match_discipline_fkey"
            columns: ["discipline"]
            isOneToOne: false
            referencedRelation: "discipline"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline: {
        Row: {
          charge: number | null
          created_at: string
          gender: string
          id: string
          is_doubles: boolean
          name: string
          tournament: string | null
        }
        Insert: {
          charge?: number | null
          created_at?: string
          gender: string
          id?: string
          is_doubles: boolean
          name: string
          tournament?: string | null
        }
        Update: {
          charge?: number | null
          created_at?: string
          gender?: string
          id?: string
          is_doubles?: boolean
          name?: string
          tournament?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discipline_tournament_fkey"
            columns: ["tournament"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      doubles_match: {
        Row: {
          created_at: string
          discipline: string
          finished_at: string | null
          id: string
          pair_1: string
          pair_2: string
          sets: Json | null
          started_at: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string
          discipline: string
          finished_at?: string | null
          id?: string
          pair_1: string
          pair_2: string
          sets?: Json | null
          started_at?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string
          discipline?: string
          finished_at?: string | null
          id?: string
          pair_1?: string
          pair_2?: string
          sets?: Json | null
          started_at?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubles_match_pair_1_fkey"
            columns: ["pair_1"]
            isOneToOne: false
            referencedRelation: "doubles_pair"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_match_pair_2_fkey"
            columns: ["pair_2"]
            isOneToOne: false
            referencedRelation: "doubles_pair"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_match_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "doubles_pair"
            referencedColumns: ["id"]
          },
        ]
      }
      doubles_pair: {
        Row: {
          created_at: string
          discipline: string
          id: string
          player_1: string
          player_2: string
        }
        Insert: {
          created_at?: string
          discipline: string
          id?: string
          player_1: string
          player_2: string
        }
        Update: {
          created_at?: string
          discipline?: string
          id?: string
          player_1?: string
          player_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubles_pair_discipline_fkey"
            columns: ["discipline"]
            isOneToOne: false
            referencedRelation: "discipline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_pair_player_1_fkey"
            columns: ["player_1"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_pair_player_2_fkey"
            columns: ["player_2"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      player: {
        Row: {
          club: string | null
          created_at: string
          gender: string
          id: string
          name: string
        }
        Insert: {
          club?: string | null
          created_at?: string
          gender: string
          id?: string
          name: string
        }
        Update: {
          club?: string | null
          created_at?: string
          gender?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      player_charges: {
        Row: {
          already_payed: number
          created_at: string
          player: string
          tournament: string | null
        }
        Insert: {
          already_payed?: number
          created_at?: string
          player: string
          tournament?: string | null
        }
        Update: {
          already_payed?: number
          created_at?: string
          player?: string
          tournament?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_charges_player_fkey"
            columns: ["player"]
            isOneToOne: true
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_charges_tournament_fkey"
            columns: ["tournament"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      singles_match: {
        Row: {
          created_at: string
          discipline: string
          finished_at: string | null
          id: string
          player_1: string
          player_2: string
          sets: Json | null
          started_at: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string
          discipline: string
          finished_at?: string | null
          id?: string
          player_1: string
          player_2: string
          sets?: Json | null
          started_at?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string
          discipline?: string
          finished_at?: string | null
          id?: string
          player_1?: string
          player_2?: string
          sets?: Json | null
          started_at?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "singles_match_player_1_fkey"
            columns: ["player_1"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "singles_match_player_2_fkey"
            columns: ["player_2"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "singles_match_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_distinct_clubs: {
        Args: never
        Returns: {
          club: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

