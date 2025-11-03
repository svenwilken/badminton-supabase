import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-matches-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <div class="matches-container">
      <div class="header">
        <h2>{{ 'TOURNAMENT_DETAIL.MATCHES.TITLE' | translate }}</h2>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          {{ 'TOURNAMENT_DETAIL.MATCHES.CREATE' | translate }}
        </button>
      </div>

      <div class="empty-state">
        <mat-icon>sports</mat-icon>
        <h3>{{ 'TOURNAMENT_DETAIL.MATCHES.EMPTY_TITLE' | translate }}</h3>
        <p>{{ 'TOURNAMENT_DETAIL.MATCHES.EMPTY_MESSAGE' | translate }}</p>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          {{ 'TOURNAMENT_DETAIL.MATCHES.CREATE' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .matches-container {
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
export class MatchesTabComponent {}

