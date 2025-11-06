import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService, Discipline } from '../../../../services/supabase.service';
import { CreateDisciplineDialogComponent } from '../../../../components/create-discipline-dialog/create-discipline-dialog.component';

@Component({
  selector: 'app-disciplines-tab',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './disciplines-tab.component.html',
  styleUrl: './disciplines-tab.component.scss'
})
export class DisciplinesTabComponent implements OnInit {
  disciplines = signal<Discipline[]>([]);
  loading = signal(true);
  tournamentId: string | null = null;
  displayedColumns: string[] = ['name', 'type', 'gender', 'charge', 'participants', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private translate: TranslateService
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

  onAddDiscipline() {
    if (!this.tournamentId) return;

    const dialogRef = this.dialog.open(CreateDisciplineDialogComponent, {
      width: '500px',
      data: { tournamentId: this.tournamentId }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        // Discipline was created successfully, reload the list
        await this.loadDisciplines();
      }
    });
  }

  onViewDiscipline(discipline: Discipline) {
    // TODO: Navigate to discipline detail view
    console.log('View discipline:', discipline);
  }

  onEditDiscipline(discipline: Discipline) {
    // TODO: Open dialog to edit discipline
    console.log('Edit discipline:', discipline);
  }

  onDeleteDiscipline(discipline: Discipline) {
    // TODO: Confirm and delete discipline
    console.log('Delete discipline:', discipline);
  }

  getDisciplineType(discipline: Discipline): string {
    return discipline.is_doubles ? 'Doubles' : 'Singles';
  }

  getGenderDisplay(gender: string): string {
    switch (gender) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      default:
        return 'Mixed';
    }
  }

  formatCharge(charge: number | null): string {
    return charge !== null ? `€${charge.toFixed(2)}` : '-';
  }
}

