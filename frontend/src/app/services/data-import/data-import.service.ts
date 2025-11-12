import { Injectable } from '@angular/core';
import { InsertPlayer, SupabaseService } from '../supabase.service';
import {
  ImportData,
  ParsedImportData,
} from '../../components/import-disciplines-dialog/model/import.model';
import { groupBy, mapValues } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  constructor(private supabase: SupabaseService) {}

  public groupByDisciplines(importData: ImportData): ParsedImportData {
    const entriesGroupedByDiscipline = groupBy(
      importData,
      ({ Disziplin, Spielklasse }) => `${Disziplin} ${Spielklasse}`,
    );

    return mapValues(entriesGroupedByDiscipline, (disciplineEntries): InsertPlayer[][] => {
      return disciplineEntries.map((entry) => {
        const players: InsertPlayer[] = [
          {
            firstname: entry.Vorname,
            lastname: entry.Name,
            gender: entry.Geschlecht,
            club: entry.Verein,
          },
        ];
        if (entry['Partner Name']) {
          players.push({
            firstname: entry['Partner Vorname']!,
            lastname: entry['Partner Name']!,
            gender: entry['Partner Geschlecht']!,
            club: entry['Partner Verein'],
          });
        }
        return players;
      });
    });
  }
}
