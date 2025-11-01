import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, Player } from '../../services/supabase.service';
import { CreatePlayerDialogComponent } from '../../components/create-player-dialog/create-player-dialog.component';
import { Gender } from '../../models/types';

@Component({
  selector: 'app-players-list',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    TranslateModule
  ],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.css'
})
export class PlayersListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Player>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  displayedColumns: string[] = ['name', 'club', 'gender', 'created_at', 'actions'];
  
  @ViewChild(MatSort) sort!: MatSort;
  
  // Edit mode state
  editingPlayerId: string | null = null;
  editedName: string = '';
  editedClub: string = '';
  editedGender: Gender = Gender.Male;
  
  // Club autocomplete
  allClubs: string[] = [];
  filteredClubs: string[] = [];
  
  // Expose Gender enum to template
  readonly Gender = Gender;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    await this.loadPlayers();
    await this.loadClubs();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    // Custom sorting accessor to handle null values and gender enum
    this.dataSource.sortingDataAccessor = (player: Player, property: string) => {
      switch (property) {
        case 'name':
          return player.name.toLowerCase();
        case 'club':
          return (player.club || '').toLowerCase();
        case 'gender':
          return player.gender;
        case 'created_at':
          return new Date(player.created_at).getTime();
        default:
          return '';
      }
    };
  }

  async loadPlayers() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.supabaseService.getPlayers();
      this.dataSource.data = data;
    } catch (err: any) {
      console.error('Error loading players:', err);
      this.error.set(err.message || this.translate.instant('PLAYERS.ERROR_LOADING'));
      this.snackBar.open(this.translate.instant('PLAYERS.ERROR_LOADING'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
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

  openCreatePlayerDialog() {
    const dialogRef = this.dialog.open(CreatePlayerDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadPlayers();
      }
    });
  }

  startEditPlayer(player: Player) {
    this.editingPlayerId = player.id;
    this.editedName = player.name;
    this.editedClub = player.club || '';
    this.editedGender = player.gender as Gender;
  }

  cancelEdit() {
    this.editingPlayerId = null;
    this.editedName = '';
    this.editedClub = '';
    this.editedGender = Gender.Male;
  }

  async savePlayer(playerId: string) {
    if (!this.editedName.trim()) {
      this.snackBar.open(this.translate.instant('PLAYERS.CREATE.NAME_REQUIRED'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      return;
    }

    try {
      await this.supabaseService.updatePlayer(playerId, {
        name: this.editedName.trim(),
        club: this.editedClub.trim() || null,
        gender: this.editedGender
      });
      this.snackBar.open(this.translate.instant('PLAYERS.EDIT.SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      this.cancelEdit();
      await this.loadPlayers();
      await this.loadClubs(); // Refresh clubs list in case a new club was added
    } catch (err: any) {
      console.error('Error updating player:', err);
      this.snackBar.open(this.translate.instant('PLAYERS.EDIT.ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }
  }

  isEditing(playerId: string): boolean {
    return this.editingPlayerId === playerId;
  }

  async deletePlayer(player: Player) {
    const confirmMessage = this.translate.instant('PLAYERS.DELETE.CONFIRM', { name: player.name });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deletePlayer(player.id);
      this.snackBar.open(this.translate.instant('PLAYERS.DELETE.SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      await this.loadPlayers();
    } catch (err: any) {
      console.error('Error deleting player:', err);
      this.snackBar.open(this.translate.instant('PLAYERS.DELETE.ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

