import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';
import { Gender } from '../../models/types';

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
    MatAutocompleteModule,
    TranslateModule
  ],
  templateUrl: './create-player-dialog.component.html',
  styleUrl: './create-player-dialog.component.css'
})
export class CreatePlayerDialogComponent implements OnInit {
  // Expose Gender enum to template
  readonly Gender = Gender;
  
  playerName = '';
  playerGender: Gender = Gender.Male;
  playerClub = '';
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Club autocomplete
  allClubs: string[] = [];
  filteredClubs: string[] = [];
  

  constructor(
    private dialogRef: MatDialogRef<CreatePlayerDialogComponent>,
    private supabaseService: SupabaseService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    await this.loadClubs();
  }

  async loadClubs() {
    try {
      this.allClubs = await this.supabaseService.getDistinctClubs();
      this.filteredClubs = this.allClubs;
    } catch (err) {
      console.error('Error loading clubs:', err);
    }
  }

  filterClubs(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredClubs = this.allClubs.filter(club => 
      club.toLowerCase().includes(filterValue)
    );
  }

  async createPlayer() {
    if (!this.playerName.trim()) {
      this.error.set(this.translate.instant('PLAYERS.CREATE.NAME_REQUIRED'));
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      await this.supabaseService.createPlayer({
        name: this.playerName.trim(),
        gender: this.playerGender,
        club: this.playerClub.trim() || null
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

