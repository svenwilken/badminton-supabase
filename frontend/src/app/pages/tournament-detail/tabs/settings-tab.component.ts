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
import { SupabaseService, Tournament } from '../../../services/supabase.service';

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
  template: `
    <div class="settings-container">
      <h2>{{ 'TOURNAMENT_DETAIL.SETTINGS.TITLE' | translate }}</h2>

      @if (tournament()) {
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>edit</mat-icon>
            <mat-card-title>{{ 'TOURNAMENT_DETAIL.SETTINGS.GENERAL' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="info-text">
              {{ 'TOURNAMENT_DETAIL.SETTINGS.GENERAL_DESCRIPTION' | translate }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card class="danger-zone-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            <mat-card-title>{{ 'TOURNAMENT_DETAIL.SETTINGS.DANGER_ZONE' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="danger-section">
              <div class="danger-info">
                <h3>{{ 'TOURNAMENT_DETAIL.SETTINGS.DELETE_TOURNAMENT' | translate }}</h3>
                <p>{{ 'TOURNAMENT_DETAIL.SETTINGS.DELETE_WARNING' | translate }}</p>
              </div>
              <button mat-raised-button color="warn" (click)="deleteTournament()">
                <mat-icon>delete</mat-icon>
                {{ 'COMMON.DELETE' | translate }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
    }

    h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 400;
    }

    .settings-card,
    .danger-zone-card {
      margin-bottom: 24px;
    }

    .info-text {
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
    }

    .danger-zone-card {
      border: 2px solid #f44336;
    }

    .danger-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .danger-info {
      flex: 1;
    }

    .danger-info h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #f44336;
    }

    .danger-info p {
      margin: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (prefers-color-scheme: dark) {
      .info-text,
      .danger-info p {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    @media (max-width: 600px) {
      .danger-section {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
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


