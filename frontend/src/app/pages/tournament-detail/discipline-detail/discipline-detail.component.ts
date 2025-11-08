import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
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
  singlesColumns: string[] = ['number', 'name', 'gender'];
  doublesColumns: string[] = ['number', 'player1', 'player2'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
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
}

