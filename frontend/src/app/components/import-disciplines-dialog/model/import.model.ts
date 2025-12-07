import { z } from 'zod';

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
export const ImportDataSchema = z.array(ImportRowSchema).superRefine((items, ctx) => {
  const seen = new Set<string>();

  items.forEach((item, index) => {
    const discipline = item.Disziplin + ' ' + item.Spielklasse;

    // Helper to generate key
    const getKey = (firstName: string, lastName: string, disc: string, gender: string) =>
      `${firstName.toLowerCase().trim()}|${lastName.toLowerCase().trim()}|${disc}|${gender}`;

    // Check Main Player
    const playerKey = getKey(item.Vorname, item.Name, discipline, item.Geschlecht);
    if (seen.has(playerKey)) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate entry: ${item.Vorname} ${item.Name} is already entered in ${discipline}`,
        path: [index, 'Name'],
      });
    } else {
      seen.add(playerKey);
    }

    // Check Partner
    if (
      item['Partner Name']?.trim() &&
      item['Partner Vorname']?.trim() &&
      item['Partner Geschlecht']
    ) {
      const partnerKey = getKey(
        item['Partner Vorname'],
        item['Partner Name'],
        discipline,
        item['Partner Geschlecht'],
      );
      if (seen.has(partnerKey)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate entry: Partner ${item['Partner Vorname']} ${item['Partner Name']} is already entered in ${discipline}`,
          path: [index, 'Partner Name'],
        });
      } else {
        seen.add(partnerKey);
      }
    }
  });
});

/**
 * Type for array of import rows
 */
export type ImportData = z.infer<typeof ImportDataSchema>;
