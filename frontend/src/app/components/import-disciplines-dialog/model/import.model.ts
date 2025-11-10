import { z } from 'zod';
import { InsertPlayer } from '../../../services/supabase.service';

/**
 * Zod schema for tournament participant import data from spreadsheet
 * Typically from Google Forms or Excel exports
 */
export const ImportRowSchema = z
  .object({
    Spielklasse: z.string().optional().or(z.literal('')),
    Disziplin: z.string().min(1, 'Discipline is required'),

    // Participant information
    Name: z.string().min(1, 'Name is required'),
    Vorname: z.string().min(1, 'First name is required'),
    Geschlecht: z.enum(['M', 'W']), // M = Male, W = Female
    Verein: z.string().optional().or(z.literal('')),

    // Partner information (for doubles disciplines)
    'Partner Name': z.string().optional().or(z.literal('')),
    'Partner Vorname': z.string().optional().or(z.literal('')),
    'Partner Geschlecht': z.enum(['M', 'W']).optional().or(z.literal('')),
    'Partner Verein': z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Check if partner fields are either all empty or all filled
      const partnerName = data['Partner Name']?.trim() || '';
      const partnerVorname = data['Partner Vorname']?.trim() || '';
      const partnerGeschlecht = data['Partner Geschlecht'] || '';

      const partnerFields = [partnerName, partnerVorname, partnerGeschlecht];
      const filledFields = partnerFields.filter((field) => field !== '');

      // Either all fields are empty (0) or all fields are filled
      return filledFields.length === 0 || filledFields.length === partnerFields.length;
    },
    {
      message: 'Partner information must be either completely filled or completely empty',
      path: ['Partner Name|Partner Vorname|Partner Geschlecht'], // Show error on the first partner field
    },
  );

/**
 * Type inferred from the Zod schema
 */
export type ImportRow = z.infer<typeof ImportRowSchema>;

/**
 * Schema for array of import rows
 */
export const ImportDataSchema = z.array(ImportRowSchema);

/**
 * Type for array of import rows
 */
export type ImportData = z.infer<typeof ImportDataSchema>;

export interface ParsedImportData {
  [discipline: string]: InsertPlayer[][];
}
