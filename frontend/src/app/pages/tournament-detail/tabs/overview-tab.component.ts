import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService, Tournament } from '../../../services/supabase.service';

@Component({
  selector: 'app-overview-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <div class="overview-container">
      <h2>{{ 'TOURNAMENT_DETAIL.OVERVIEW.TITLE' | translate }}</h2>
      
      @if (tournament()) {
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>info</mat-icon>
            <mat-card-title>{{ 'TOURNAMENT_DETAIL.OVERVIEW.INFORMATION' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <span class="info-label">{{ 'TOURNAMENT_DETAIL.OVERVIEW.NAME' | translate }}:</span>
              <span class="info-value">{{ tournament()?.name }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="info-row">
              <span class="info-label">{{ 'TOURNAMENT_DETAIL.OVERVIEW.CREATED_AT' | translate }}:</span>
              <span class="info-value">{{ tournament()?.created_at | date:'medium' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>analytics</mat-icon>
            <mat-card-title>{{ 'TOURNAMENT_DETAIL.OVERVIEW.STATISTICS' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon>category</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">0</span>
                  <span class="stat-label">{{ 'TOURNAMENT_DETAIL.OVERVIEW.DISCIPLINES' | translate }}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>sports</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">0</span>
                  <span class="stat-label">{{ 'TOURNAMENT_DETAIL.OVERVIEW.MATCHES' | translate }}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>people</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">0</span>
                  <span class="stat-label">{{ 'TOURNAMENT_DETAIL.OVERVIEW.PARTICIPANTS' | translate }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .overview-container {
      max-width: 1200px;
    }

    h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 400;
    }

    .info-card,
    .stats-card {
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
    }

    .info-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .info-value {
      color: rgba(0, 0, 0, 0.87);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      padding: 16px 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-item mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-primary);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 500;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    @media (prefers-color-scheme: dark) {
      .info-label {
        color: rgba(255, 255, 255, 0.7);
      }

      .info-value,
      .stat-label {
        color: rgba(255, 255, 255, 0.87);
      }
    }
  `]
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

