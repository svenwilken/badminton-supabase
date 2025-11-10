import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
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

  public groupByDisciplines(importData: ImportData) {
    const entriesGroupedByDiscipline = groupBy(
      importData,
      ({ Disziplin, Spielklasse }) => `${Disziplin} ${Spielklasse}`,
    );

    // return mapValues(entriesGroupedByDiscipline, (entry) => {
    //   const players = [
    //     {
    //       name: entry.Name,
    //       vorname: entry.Vorname,
    //       gender: entry.Geschlecht,
    //       club: entry.Verein,
    //     },
    //   ];
    //   if (entry['Partner Name']) {
    //     players.push({
    //       name: entry['Partner Name'],
    //       vorname: entry['Partner Vorname'],
    //       gender: entry['Partner Geschlecht'],
    //       club: entry['Partner Verein'],
    //     });
    //   }
    //   return players;
    // });
  }
}
