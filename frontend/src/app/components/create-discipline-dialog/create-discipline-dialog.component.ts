import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';
import { DisciplineGender } from '../../models/types';

interface DialogData {
  tournamentId: string;
}

@Component({
  selector: 'app-create-discipline-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSlideToggleModule,
    TranslateModule
  ],
  templateUrl: './create-discipline-dialog.component.html',
  styleUrl: './create-discipline-dialog.component.scss'
})
export class CreateDisciplineDialogComponent {
  // Expose DisciplineGender enum to template
  readonly DisciplineGender = DisciplineGender;
  
  disciplineName = '';
  isDoubles = false;
  gender: DisciplineGender = DisciplineGender.Male;
  charge: number | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private dialogRef: MatDialogRef<CreateDisciplineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private supabaseService: SupabaseService,
    private translate: TranslateService
  ) {}

  async createDiscipline() {
    if (!this.disciplineName.trim()) {
      this.error.set(this.translate.instant('TOURNAMENT_DETAIL.DISCIPLINES.CREATE.NAME_REQUIRED'));
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      await this.supabaseService.createDiscipline({
        name: this.disciplineName.trim(),
        is_doubles: this.isDoubles,
        gender: this.gender,
        charge: this.charge,
        tournament: this.data.tournamentId
      });
      this.dialogRef.close(true);
    } catch (err: any) {
      console.error('Error creating discipline:', err);
      this.error.set(err.message || this.translate.instant('TOURNAMENT_DETAIL.DISCIPLINES.CREATE.ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

