/**
 * Shared types and enums for the application
 */

/**
 * Gender enum for players
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

/**
 * Gender enum for disciplines (includes mixed)
 */
export enum DisciplineGender {
  Male = 'male',
  Female = 'female',
  Mixed = 'mixed'
}

/**
 * Type guard to check if a string is a valid DisciplineGender
 */
export function isDisciplineGender(value: string): value is DisciplineGender {
  return value === DisciplineGender.Male || value === DisciplineGender.Female || value === DisciplineGender.Mixed;
}

