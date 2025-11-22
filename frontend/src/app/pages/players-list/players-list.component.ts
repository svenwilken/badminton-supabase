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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, getPlayerFullName } from '../../services/supabase.service';
import { CreatePlayerDialogComponent } from '../../components/create-player-dialog/create-player-dialog.component';
import { ClubAutocompleteComponent } from '../../components/club-autocomplete/club-autocomplete.component';
import { Gender } from '../../models/types';
import { Player } from '../../../shared/supabase.types';
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
    TranslateModule,
    ClubAutocompleteComponent,
  ],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.scss',
})
export class PlayersListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Player>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  displayedColumns: string[] = ['name', 'club', 'gender', 'created_at', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;

  // Edit mode state
  editingPlayerId: string | null = null;
  editedFirstname: string = '';
  editedLastname: string = '';
  editedClub: string = '';
  editedGender: Gender = Gender.Male;

  // Expose Gender enum to template
  readonly Gender = Gender;

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    await this.loadPlayers();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    // Custom sorting accessor to handle null values and gender enum
    this.dataSource.sortingDataAccessor = (player: Player, property: string) => {
      switch (property) {
        case 'name':
          return getPlayerFullName(player).toLowerCase();
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
      this.snackBar.open(
        this.translate.instant('PLAYERS.ERROR_LOADING'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
    } finally {
      this.loading.set(false);
    }
  }

  openCreatePlayerDialog() {
    const dialogRef = this.dialog.open(CreatePlayerDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadPlayers();
      }
    });
  }

  startEditPlayer(player: Player) {
    this.editingPlayerId = player.id;
    this.editedFirstname = player.firstname;
    this.editedLastname = player.lastname;
    this.editedClub = player.club || '';
    this.editedGender = player.gender as Gender;
  }

  cancelEdit() {
    this.editingPlayerId = null;
    this.editedFirstname = '';
    this.editedLastname = '';
    this.editedClub = '';
    this.editedGender = Gender.Male;
  }

  async savePlayer(playerId: string) {
    if (!this.editedFirstname.trim()) {
      this.snackBar.open(
        this.translate.instant('PLAYERS.CREATE.FIRSTNAME_REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
      return;
    }

    if (!this.editedLastname.trim()) {
      this.snackBar.open(
        this.translate.instant('PLAYERS.CREATE.LASTNAME_REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
      return;
    }

    try {
      await this.supabaseService.updatePlayer(playerId, {
        firstname: this.editedFirstname.trim(),
        lastname: this.editedLastname.trim(),
        club: this.editedClub.trim() || null,
        gender: this.editedGender,
      });
      this.snackBar.open(
        this.translate.instant('PLAYERS.EDIT.SUCCESS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
      this.cancelEdit();
      await this.loadPlayers();
    } catch (err: any) {
      console.error('Error updating player:', err);
      this.snackBar.open(
        this.translate.instant('PLAYERS.EDIT.ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
    }
  }

  isEditing(playerId: string): boolean {
    return this.editingPlayerId === playerId;
  }

  async deletePlayer(player: Player) {
    const confirmMessage = this.translate.instant('DELETE.CONFIRM', {
      name: getPlayerFullName(player),
    });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deletePlayer(player.id);
      const item = this.translate.instant('PLAYERS.TITLE').slice(0, -1); // Remove 's' from 'Players'
      this.snackBar.open(
        this.translate.instant('DELETE.SUCCESS', { item }),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
      await this.loadPlayers();
    } catch (err: any) {
      console.error('Error deleting player:', err);
      const item = this.translate.instant('PLAYERS.TITLE').slice(0, -1).toLowerCase();
      this.snackBar.open(
        this.translate.instant('DELETE.ERROR', { item }),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
