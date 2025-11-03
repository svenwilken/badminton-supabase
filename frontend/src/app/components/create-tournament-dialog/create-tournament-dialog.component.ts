import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-create-tournament-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './create-tournament-dialog.component.html',
  styleUrl: './create-tournament-dialog.component.scss'
})
export class CreateTournamentDialogComponent {
  tournamentName = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private dialogRef: MatDialogRef<CreateTournamentDialogComponent>,
    private supabaseService: SupabaseService,
    private translate: TranslateService
  ) {}

  async createTournament() {
    if (!this.tournamentName.trim()) {
      this.error.set(this.translate.instant('TOURNAMENTS.CREATE.NAME_REQUIRED'));
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      await this.supabaseService.createTournament(this.tournamentName.trim());
      this.dialogRef.close(true);
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      this.error.set(err.message || this.translate.instant('TOURNAMENTS.CREATE.ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

