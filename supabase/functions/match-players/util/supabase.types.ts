import { Database } from "databaseTypes";

export type Player = Database["public"]["Tables"]["player"]["Row"];
export type InsertPlayer = Database["public"]["Tables"]["player"]["Insert"];
