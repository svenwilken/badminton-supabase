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
import { SupabaseService, Player, DoublesParticipant } from '../../services/supabase.service';

@Component({
  selector: 'app-add-doubles-participant-dialog',
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
  templateUrl: './add-doubles-participant-dialog.component.html',
  styleUrl: './add-doubles-participant-dialog.component.scss'
})
export class AddDoublesParticipantDialogComponent implements OnInit {
  players = signal<Player[]>([]);
  availablePlayers = signal<Player[]>([]);
  filteredPlayer1Options = signal<Player[]>([]);
  filteredPlayer2Options = signal<Player[]>([]);
  selectedPlayer1: Player | string | null = null;
  selectedPlayer2: Player | string | null = null;
  selectedPlayer1Id = '';
  selectedPlayer2Id = '';
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  disciplineGender: string;

  isEditMode: boolean = false;
  editingParticipant: DoublesParticipant | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      disciplineId: string; 
      gender: string; 
      existingPlayerIds: string[];
      editParticipant?: DoublesParticipant;
    },
    private dialogRef: MatDialogRef<AddDoublesParticipantDialogComponent>,
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
      this.selectedPlayer1 = this.editingParticipant.player_1_details;
      this.selectedPlayer1Id = this.editingParticipant.player_1;
      
      this.selectedPlayer2 = this.editingParticipant.player_2_details;
      this.selectedPlayer2Id = this.editingParticipant.player_2;
      
      // Trigger filters to populate the options
      this.filterPlayer1Options();
      this.filterPlayer2Options();
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
        
        // For mixed doubles, allow any gender
        // For male/female doubles, only show players of that gender
        if (this.disciplineGender === 'mixed') {
          return notParticipating;
        } else {
          return notParticipating && player.gender === this.disciplineGender;
        }
      });
      
      this.availablePlayers.set(available);
      this.filteredPlayer1Options.set(available);
      this.filteredPlayer2Options.set(available);
    } catch (err) {
      console.error('Error loading players:', err);
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.LOAD_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  onPlayer1Changed(value: Player | string | null) {
    if (typeof value === 'string') {
      // User is typing - filter based on text
      this.filterPlayer1Options(value);
    }
  }

  onPlayer2Changed(value: Player | string | null) {
    if (typeof value === 'string') {
      // User is typing - filter based on text
      this.filterPlayer2Options(value);
    }
  }

  private isPlayer(value: any): value is Player {
    return value !== null && typeof value === 'object' && 'gender' in value && 'id' in value && 'name' in value;
  }

  filterPlayer1Options(searchText: string = '') {
    const search = searchText.toLowerCase().trim();
    let baseOptions = this.availablePlayers().filter(p => p.id !== this.selectedPlayer2Id);
    
    // For mixed doubles, if player 2 is selected, only show opposite gender
    if (this.disciplineGender === 'mixed' && this.isPlayer(this.selectedPlayer2)) {
      const player2 = this.selectedPlayer2;
      baseOptions = baseOptions.filter(p => p.gender !== player2.gender);
    }
    
    if (!search) {
      this.filteredPlayer1Options.set(baseOptions);
      return;
    }

    const filtered = baseOptions.filter(player => 
      player.name.toLowerCase().includes(search) ||
      (player.club && player.club.toLowerCase().includes(search))
    );
    this.filteredPlayer1Options.set(filtered);
  }

  filterPlayer2Options(searchText: string = '') {
    const search = searchText.toLowerCase().trim();
    let baseOptions = this.availablePlayers().filter(p => p.id !== this.selectedPlayer1Id);
    
    // For mixed doubles, if player 1 is selected, only show opposite gender
    if (this.disciplineGender === 'mixed' && this.isPlayer(this.selectedPlayer1)) {
      const player1 = this.selectedPlayer1;
      baseOptions = baseOptions.filter(p => p.gender !== player1.gender);
    }
    
    if (!search) {
      this.filteredPlayer2Options.set(baseOptions);
      return;
    }

    const filtered = baseOptions.filter(player => 
      player.name.toLowerCase().includes(search) ||
      (player.club && player.club.toLowerCase().includes(search))
    );
    this.filteredPlayer2Options.set(filtered);
  }

  onPlayer1Selected(player: Player) {
    this.selectedPlayer1 = player;
    this.selectedPlayer1Id = player.id;
    this.error.set(null);
    // Update player 2 options to exclude selected player 1
    this.filterPlayer2Options();
  }

  onPlayer2Selected(player: Player) {
    this.selectedPlayer2 = player;
    this.selectedPlayer2Id = player.id;
    this.error.set(null);
    // Update player 1 options to exclude selected player 2
    this.filterPlayer1Options();
  }

  displayPlayerFn(player: Player | null): string {
    if (!player) return '';
    return player.club ? `${player.name} - ${player.club}` : player.name;
  }

  async addParticipant() {
    if (!this.selectedPlayer1 || !this.selectedPlayer2 || !this.selectedPlayer1Id || !this.selectedPlayer2Id) {
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.SELECT_BOTH_PLAYERS'));
      return;
    }

    // Ensure both selections are player objects
    if (typeof this.selectedPlayer1 === 'string' || typeof this.selectedPlayer2 === 'string') {
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.SELECT_BOTH_PLAYERS'));
      return;
    }

    if (this.selectedPlayer1Id === this.selectedPlayer2Id) {
      this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.DIFFERENT_PLAYERS'));
      return;
    }

    // For mixed doubles, validate one male and one female
    if (this.disciplineGender === 'mixed') {
      if (this.selectedPlayer1.gender === this.selectedPlayer2.gender) {
        this.error.set(this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.ADD.MIXED_GENDER_REQUIRED'));
        return;
      }
    }

    try {
      this.submitting.set(true);
      this.error.set(null);
      
      if (this.isEditMode && this.editingParticipant) {
        // Update existing participant
        await this.supabaseService.updateDoublesParticipant(
          this.editingParticipant.id,
          this.selectedPlayer1Id, 
          this.selectedPlayer2Id
        );
      } else {
        // Add new participant
        await this.supabaseService.addDoublesParticipant(
          this.data.disciplineId, 
          this.selectedPlayer1Id, 
          this.selectedPlayer2Id
        );
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

