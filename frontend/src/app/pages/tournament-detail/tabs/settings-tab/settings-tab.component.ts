import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, Tournament } from '../../../../services/supabase.service';

@Component({
  selector: 'app-settings-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './settings-tab.component.html',
  styleUrl: './settings-tab.component.scss'
})
export class SettingsTabComponent implements OnInit {
  tournament = signal<Tournament | null>(null);
  tournamentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.tournamentId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (this.tournamentId) {
      await this.loadTournament();
    }
  }

  async loadTournament() {
    if (!this.tournamentId) return;

    try {
      const tournaments = await this.supabaseService.getTournaments();
      const tournament = tournaments.find(t => t.id === this.tournamentId);
      if (tournament) {
        this.tournament.set(tournament);
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
    }
  }

  async deleteTournament() {
    if (!this.tournament()) return;

    const confirmMessage = this.translate.instant(
      'TOURNAMENT_DETAIL.SETTINGS.DELETE_CONFIRM',
      { name: this.tournament()?.name }
    );

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deleteTournament(this.tournament()!.id);
      this.snackBar.open(
        this.translate.instant('TOURNAMENT_DETAIL.SETTINGS.DELETE_SUCCESS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error('Error deleting tournament:', err);
      this.snackBar.open(
        this.translate.instant('TOURNAMENT_DETAIL.SETTINGS.DELETE_ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
    }
  }
}

