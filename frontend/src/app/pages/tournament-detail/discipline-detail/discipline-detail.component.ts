import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, Discipline, SinglesParticipant, DoublesParticipant } from '../../../services/supabase.service';

@Component({
  selector: 'app-discipline-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './discipline-detail.component.html',
  styleUrl: './discipline-detail.component.scss'
})
export class DisciplineDetailComponent implements OnInit {
  discipline = signal<Discipline | null>(null);
  loading = signal(true);
  singlesParticipants = signal<SinglesParticipant[]>([]);
  doublesParticipants = signal<DoublesParticipant[]>([]);
  disciplineId: string | null = null;
  tournamentId: string | null = null;
  
  // Column definitions
  singlesColumns: string[] = ['number', 'player', 'actions'];
  doublesColumns: string[] = ['number', 'player1', 'player2', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.disciplineId = this.route.snapshot.paramMap.get('disciplineId');
    this.tournamentId = this.route.snapshot.paramMap.get('tournamentId');
    
    if (this.disciplineId) {
      await this.loadDiscipline();
    }
  }

  async loadDiscipline() {
    if (!this.disciplineId) return;
    
    try {
      this.loading.set(true);
      const data = await this.supabaseService.getDisciplineById(this.disciplineId);
      this.discipline.set(data);

      // Load participants based on discipline type
      if (data.is_doubles) {
        await this.loadDoublesParticipants();
      } else {
        await this.loadSinglesParticipants();
      }
    } catch (err) {
      console.error('Error loading discipline:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadSinglesParticipants() {
    if (!this.disciplineId) return;
    
    try {
      const participants = await this.supabaseService.getSinglesParticipants(this.disciplineId);
      this.singlesParticipants.set(participants);
    } catch (err) {
      console.error('Error loading singles participants:', err);
    }
  }

  async loadDoublesParticipants() {
    if (!this.disciplineId) return;
    
    try {
      const participants = await this.supabaseService.getDoublesParticipants(this.disciplineId);
      this.doublesParticipants.set(participants);
    } catch (err) {
      console.error('Error loading doubles participants:', err);
    }
  }

  goBack() {
    if (this.tournamentId) {
      this.router.navigate(['/tournament', this.tournamentId, 'disciplines']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getGenderTranslationKey(gender: string): string {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'GENDER.MALE';
      case 'female':
        return 'GENDER.FEMALE';
      case 'mixed':
        return 'GENDER.MIXED';
      default:
        return 'GENDER.MIXED';
    }
  }

  async onDeleteSinglesParticipant(participant: SinglesParticipant) {
    const confirmMessage = this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.CONFIRM', { 
      name: participant.player.name 
    });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deleteSinglesParticipant(participant.discipline_id, participant.player_id);
      this.snackBar.open(
        this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.SUCCESS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      await this.loadSinglesParticipants();
      // Reload discipline to update participant count
      if (this.disciplineId) {
        const data = await this.supabaseService.getDisciplineById(this.disciplineId);
        this.discipline.set(data);
      }
    } catch (err: any) {
      console.error('Error deleting singles participant:', err);
      this.snackBar.open(
        this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
    }
  }

  async onDeleteDoublesParticipant(participant: DoublesParticipant) {
    const confirmMessage = this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.CONFIRM_PAIR', { 
      player1: participant.player_1_details.name,
      player2: participant.player_2_details.name
    });
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await this.supabaseService.deleteDoublesParticipant(participant.id);
      this.snackBar.open(
        this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.SUCCESS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      await this.loadDoublesParticipants();
      // Reload discipline to update participant count
      if (this.disciplineId) {
        const data = await this.supabaseService.getDisciplineById(this.disciplineId);
        this.discipline.set(data);
      }
    } catch (err: any) {
      console.error('Error deleting doubles participant:', err);
      this.snackBar.open(
        this.translate.instant('DISCIPLINE_DETAIL.PARTICIPANTS.DELETE.ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
    }
  }
}

