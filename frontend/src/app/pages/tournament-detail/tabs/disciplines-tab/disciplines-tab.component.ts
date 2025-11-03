import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService, Discipline } from '../../../../services/supabase.service';

@Component({
  selector: 'app-disciplines-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './disciplines-tab.component.html',
  styleUrl: './disciplines-tab.component.css'
})
export class DisciplinesTabComponent implements OnInit {
  disciplines = signal<Discipline[]>([]);
  loading = signal(true);
  tournamentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.tournamentId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (this.tournamentId) {
      await this.loadDisciplines();
    }
  }

  async loadDisciplines() {
    if (!this.tournamentId) return;
    
    try {
      this.loading.set(true);
      const data = await this.supabaseService.getDisciplinesByTournament(this.tournamentId);
      this.disciplines.set(data);
    } catch (err) {
      console.error('Error loading disciplines:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

