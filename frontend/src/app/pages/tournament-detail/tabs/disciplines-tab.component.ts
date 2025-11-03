import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService, Discipline } from '../../../services/supabase.service';

@Component({
  selector: 'app-disciplines-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="disciplines-container">
      <div class="header">
        <h2>{{ 'TOURNAMENT_DETAIL.DISCIPLINES.TITLE' | translate }}</h2>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          {{ 'TOURNAMENT_DETAIL.DISCIPLINES.ADD' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        </div>
      }

      @if (!loading() && disciplines().length === 0) {
        <div class="empty-state">
          <mat-icon>category</mat-icon>
          <h3>{{ 'TOURNAMENT_DETAIL.DISCIPLINES.EMPTY_TITLE' | translate }}</h3>
          <p>{{ 'TOURNAMENT_DETAIL.DISCIPLINES.EMPTY_MESSAGE' | translate }}</p>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            {{ 'TOURNAMENT_DETAIL.DISCIPLINES.ADD' | translate }}
          </button>
        </div>
      }

      @if (!loading() && disciplines().length > 0) {
        <div class="disciplines-grid">
          @for (discipline of disciplines(); track discipline.id) {
            <mat-card class="discipline-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>category</mat-icon>
                <mat-card-title>{{ discipline.name }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="discipline-info">
                  <mat-chip-set>
                    <mat-chip>
                      <mat-icon>people</mat-icon>
                      {{ 'TOURNAMENT_DETAIL.DISCIPLINES.PARTICIPANTS' | translate }}: 0
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">
                  <mat-icon>visibility</mat-icon>
                  {{ 'COMMON.VIEW' | translate }}
                </button>
                <button mat-button color="accent">
                  <mat-icon>edit</mat-icon>
                  {{ 'COMMON.EDIT' | translate }}
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .disciplines-container {
      max-width: 1200px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.26);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .disciplines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .discipline-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .discipline-info {
      padding: 8px 0;
    }

    mat-chip-set {
      display: flex;
      flex-wrap: wrap;
    }

    mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    mat-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @media (prefers-color-scheme: dark) {
      .empty-state mat-icon {
        color: rgba(255, 255, 255, 0.3);
      }

      .empty-state p {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  `]
})
export class DisciplinesTabComponent implements OnInit {
  disciplines = signal<Discipline[]>([]);
  loading = signal(true);
  tournamentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.tournamentId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (this.tournamentId) {
      await this.loadDisciplines();
    }
  }

  async loadDisciplines() {
    if (!this.tournamentId) return;
    
    try {
      this.loading.set(true);
      const data = await this.supabaseService.getDisciplinesByTournament(this.tournamentId);
      this.disciplines.set(data);
    } catch (err) {
      console.error('Error loading disciplines:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

