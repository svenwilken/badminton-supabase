import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';
import { Gender } from '../../models/types';
import { ClubAutocompleteComponent } from '../club-autocomplete/club-autocomplete.component';

@Component({
  selector: 'app-create-player-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    TranslateModule,
    ClubAutocompleteComponent,
  ],
  templateUrl: './create-player-dialog.component.html',
  styleUrl: './create-player-dialog.component.scss',
})
export class CreatePlayerDialogComponent {
  // Expose Gender enum to template
  readonly Gender = Gender;

  playerFirstname = '';
  playerLastname = '';
  playerGender: Gender = Gender.Male;
  playerClub = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private dialogRef: MatDialogRef<CreatePlayerDialogComponent>,
    private supabaseService: SupabaseService,
    private translate: TranslateService,
  ) {}

  async createPlayer() {
    if (!this.playerFirstname.trim()) {
      this.error.set(this.translate.instant('PLAYERS.CREATE.FIRSTNAME_REQUIRED'));
      return;
    }

    if (!this.playerLastname.trim()) {
      this.error.set(this.translate.instant('PLAYERS.CREATE.LASTNAME_REQUIRED'));
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      await this.supabaseService.createPlayer({
        firstname: this.playerFirstname.trim(),
        lastname: this.playerLastname.trim(),
        gender: this.playerGender,
        club: this.playerClub.trim() || null,
      });
      this.dialogRef.close(true);
    } catch (err: any) {
      console.error('Error creating player:', err);
      this.error.set(err.message || this.translate.instant('PLAYERS.CREATE.ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
