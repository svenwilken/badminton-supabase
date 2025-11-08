import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, Player, SinglesParticipant } from '../../services/supabase.service';

@Component({
  selector: 'app-add-singles-participant-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './add-singles-participant-dialog.component.html',
  styleUrl: './add-singles-participant-dialog.component.scss'
})
export class AddSinglesParticipantDialogComponent implements OnInit {
  players = signal<Player[]>([]);
  availablePlayers = signal<Player[]>([]);
  filteredPlayers = signal<Player[]>([]);
  selectedPlayer: Player | string | null = null;
  selectedPlayerId = '';
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  disciplineGender: string;

  isEditMode: boolean = false;
  editingParticipant: SinglesParticipant | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      disciplineId: string; 
      gender: string; 
      existingPlayerIds: string[];
      editParticipant?: SinglesParticipant;
    },
    private dialogRef: MatDialogRef<AddSinglesParticipantDialogComponent>,
    private supabaseService: SupabaseService,
    private translate: TranslateService
  ) {
    this.disciplineGender = data.gender;
    this.isEditMode = !!data.editParticipant;
    this.editingParticipant = data.editParticipant || null;
  }

  async ngOnInit() {
    await this.loadPlayers();
    
    // If editing, set the initial values
    if (this.isEditMode && this.editingParticipant) {
      this.selectedPlayer = this.editingParticipant.player;
      this.selectedPlayerId = this.editingParticipant.player_id;
      
      // Trigger filter to populate the options
      this.filterPlayers();
    }
  }

  async loadPlayers() {
    try {
      this.loading.set(true);
      const allPlayers = await this.supabaseService.getPlayers();
      this.players.set(allPlayers);
      
      // Filter out already participating players and filter by gender
      const available = allPlayers.filter(player => {
        const notParticipating = !this.data.existingPlayerIds.includes(player.id);
        const genderMatch = this.disciplineGender === 'mixed' || player.gender === this.disciplineGender;
        return notParticipating && genderMatch;
      });
      
      this.availablePlayers.set(available);
      this.filteredPlayers.set(available);
    } catch (err) {
      console.error('Error loading players:', err);
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.LOAD_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  onPlayerChanged(value: Player | string | null) {
    if (typeof value === 'string') {
      // User is typing - filter based on text
      this.filterPlayers(value);
    }
  }

  filterPlayers(searchText: string = '') {
    const search = searchText.toLowerCase().trim();
    if (!search) {
      this.filteredPlayers.set(this.availablePlayers());
      return;
    }

    const filtered = this.availablePlayers().filter(player => 
      player.name.toLowerCase().includes(search) ||
      (player.club && player.club.toLowerCase().includes(search))
    );
    this.filteredPlayers.set(filtered);
  }

  onPlayerSelected(player: Player) {
    this.selectedPlayer = player;
    this.selectedPlayerId = player.id;
    this.error.set(null);
  }

  displayPlayerFn(player: Player | null): string {
    if (!player) return '';
    return player.club ? `${player.name} - ${player.club}` : player.name;
  }

  async addParticipant() {
    if (!this.selectedPlayer || !this.selectedPlayerId) {
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.SELECT_PLAYER'));
      return;
    }

    // Ensure selection is a player object
    if (typeof this.selectedPlayer === 'string') {
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.SELECT_PLAYER'));
      return;
    }

    try {
      this.submitting.set(true);
      this.error.set(null);
      
      if (this.isEditMode && this.editingParticipant) {
        // Update existing participant
        await this.supabaseService.updateSinglesParticipant(
          this.data.disciplineId, 
          this.editingParticipant.player_id, 
          this.selectedPlayerId
        );
      } else {
        // Add new participant
        await this.supabaseService.addSinglesParticipant(this.data.disciplineId, this.selectedPlayerId);
      }
      
      this.dialogRef.close(true);
    } catch (err: any) {
      console.error('Error saving participant:', err);
      this.error.set(err.message || this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.ERROR'));
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

