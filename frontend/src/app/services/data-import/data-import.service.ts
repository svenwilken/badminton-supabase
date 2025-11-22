import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { ImportData } from '../../components/import-disciplines-dialog/model/import.model';
import { groupBy, mapValues } from 'lodash';
import {
  MatchedImportData,
  ParsedImportData,
  PlayerMatchResult,
} from '../../../shared/import.type';
import { InsertPlayer, Player } from '../../../shared/supabase.types';

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

  public async matchPlayers(importData: ParsedImportData): Promise<MatchedImportData> {
    const databasePlayers = await this.supabase.getPlayers();
    return mapValues(importData, (importPlayers) => {
      return importPlayers.map((team) => {
        return team.map((player) => ({
          ...player,
          match: this.matchPlayer(player, databasePlayers),
        }));
      });
    });
  }

  private matchPlayer(importPlayer: InsertPlayer, databasePlayers: Player[]): PlayerMatchResult {
    return {
      isExactMatch: false,
      matchingPlayer: null,
      mostSimilarPlayers: [],
    };
  }
}
