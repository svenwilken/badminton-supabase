import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';
import { CreateTournamentDialogComponent } from '../../components/create-tournament-dialog/create-tournament-dialog.component';
import { Tournament } from '../../../shared/supabase.types';

@Component({
  selector: 'app-tournament-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.scss',
})
export class TournamentListComponent implements OnInit {
  tournaments = signal<Tournament[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    await this.loadTournaments();
  }

  async loadTournaments() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.supabaseService.getTournaments();
      this.tournaments.set(data);
    } catch (err: any) {
      console.error('Error loading tournaments:', err);
      this.error.set(err.message || this.translate.instant('TOURNAMENTS.ERROR_LOADING'));
      this.snackBar.open(
        this.translate.instant('TOURNAMENTS.ERROR_LOADING'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
    } finally {
      this.loading.set(false);
    }
  }

  openCreateTournamentDialog() {
    const dialogRef = this.dialog.open(CreateTournamentDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadTournaments();
      }
    });
  }

  async deleteTournament(tournament: Tournament) {
    const confirmMessage = this.translate.instant('DELETE.CONFIRM', { name: tournament.name });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deleteTournament(tournament.id);
      const item = this.translate.instant('TOURNAMENTS.TITLE').slice(0, -1); // Remove 's'
      this.snackBar.open(
        this.translate.instant('DELETE.SUCCESS', { item }),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
      await this.loadTournaments();
    } catch (err: any) {
      console.error('Error deleting tournament:', err);
      const item = this.translate.instant('TOURNAMENTS.TITLE').slice(0, -1).toLowerCase();
      this.snackBar.open(
        this.translate.instant('DELETE.ERROR', { item }),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 },
      );
    }
  }

  viewTournament(tournament: Tournament) {
    this.router.navigate(['/tournament', tournament.id]);
  }

  navigateToPlayers() {
    this.router.navigate(['/players']);
  }
}
