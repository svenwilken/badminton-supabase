import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService, Discipline } from '../../../services/supabase.service';

@Component({
  selector: 'app-discipline-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './discipline-detail.component.html',
  styleUrl: './discipline-detail.component.scss'
})
export class DisciplineDetailComponent implements OnInit {
  discipline = signal<Discipline | null>(null);
  loading = signal(true);
  disciplineId: string | null = null;
  tournamentId: string | null = null;

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
    } catch (err) {
      console.error('Error loading discipline:', err);
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    if (this.tournamentId) {
      this.router.navigate(['/tournament', this.tournamentId, 'disciplines']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

