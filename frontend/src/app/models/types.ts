/**
 * Shared types and enums for the application
 */

/**
 * Gender enum for players and disciplines
 */
export enum Gender {
  Male = 'male',
  Female = 'female'
}

/**
 * Type guard to check if a string is a valid Gender
 */
export function isGender(value: string): value is Gender {
  return value === Gender.Male || value === Gender.Female;
}

