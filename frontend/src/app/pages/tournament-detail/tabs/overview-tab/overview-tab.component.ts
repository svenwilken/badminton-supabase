import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService, Tournament } from '../../../../services/supabase.service';

@Component({
  selector: 'app-overview-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './overview-tab.component.html',
  styleUrl: './overview-tab.component.scss'
})
export class OverviewTabComponent implements OnInit {
  tournament = signal<Tournament | null>(null);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    const tournamentId = this.route.parent?.snapshot.paramMap.get('id');
    if (tournamentId) {
      await this.loadTournament(tournamentId);
    }
  }

  async loadTournament(id: string) {
    try {
      const tournaments = await this.supabaseService.getTournaments();
      const tournament = tournaments.find(t => t.id === id);
      if (tournament) {
        this.tournament.set(tournament);
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
    }
  }
}

