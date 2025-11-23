import { Component, Inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SheetJsService } from '../../services/sheetjs.service';
import { ImportData, ImportDataSchema } from './model/import.model';
import z from 'zod';
import { ImportService } from '../../services/data-import/data-import.service';
import { ParsedImportData } from '../../../shared/import.type';
import { SupabaseService } from '../../services/supabase.service';
import { DisciplineGender } from '../../models/types';
import { InsertPlayer } from '../../../shared/supabase.types';

export interface ImportDialogData {
  tournamentId: string;
}

@Component({
  selector: 'app-import-disciplines-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './import-disciplines-dialog.component.html',
  styleUrl: './import-disciplines-dialog.component.scss',
})
export class ImportDisciplinesDialogComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  dragOver = signal(false);
  validationErrors = signal<z.core.$ZodIssue[] | null>(null);
  parsedImportData = signal<ParsedImportData | null>(null);
  disciplineKeys = signal<string[]>([]);
  processedDisciplineKeys = signal<string[]>([]);
  editedDisciplineNames = signal<Map<string, string>>(new Map());
  importError = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<ImportDisciplinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDialogData,
    private sheetJsService: SheetJsService,
    private importService: ImportService,
    private supabaseService: SupabaseService,
  ) {}

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      try {
        await this.handleFile(input.files[0]);
      } catch (error) {
        console.error(error);
        input.files = null;
        input.value = '';
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      try {
        await this.handleFile(event.dataTransfer.files[0]);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async handleFile(file: File) {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv',
      '.xls',
      '.xlsx',
    ];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValid = validTypes.includes(file.type) || validTypes.includes(fileExtension);
    if (isValid) {
      this.selectedFile.set(file);
    }
  }

  removeFile() {
    this.selectedFile.set(null);
    this.validationErrors.set(null);
  }

  async onImport() {
    if (!this.selectedFile()) {
      return;
    }
    this.uploading.set(true);
    const file = this.selectedFile()!;

    let { data } = file.type.includes('csv')
      ? await this.sheetJsService.importFromCsv(file)
      : await this.sheetJsService.importFromExcel(file);

    data = data.filter((row) => row['Partner Name'] !== 'Freimeldung'); // remove freimeldung row

    const parsedData = ImportDataSchema.safeParse(data);
    if (!parsedData.success) {
      this.validationErrors.set(parsedData.error.issues);
      this.uploading.set(false);
      throw new Error('Invalid file');
    }
    this.validationErrors.set(null);

    const parsedImportData = this.importService.groupByDisciplines(parsedData.data);
    this.parsedImportData.set(parsedImportData);
    const keys = Object.keys(parsedImportData);
    this.disciplineKeys.set(keys);

    // Initialize edited names with original names
    const editedNames = new Map<string, string>();
    keys.forEach((key) => editedNames.set(key, key));
    this.editedDisciplineNames.set(editedNames);

    this.uploading.set(false);
  }

  async onImportDiscipline() {
    const index = this.stepper.selectedIndex;
    if (index !== undefined) {
      const disciplineKey = this.disciplineKeys()[index];
      const participants = this.parsedImportData()![disciplineKey];
      const editedName = this.getEditedDisciplineName(disciplineKey);

      try {
        this.uploading.set(true);
        this.importError.set(null);

        // Determine discipline properties from participants
        const isDoubles = participants[0].length > 1;
        const gender = this.determineDisciplineGender(participants);

        // Validate: Mixed disciplines must be doubles
        if (gender === DisciplineGender.Mixed && !isDoubles) {
          throw new Error('MIXED_SINGLES_ERROR');
        }

        // Create the discipline
        const createdDiscipline = await this.supabaseService.createDiscipline({
          name: editedName,
          is_doubles: isDoubles,
          gender: gender,
          charge: null,
          tournament: this.data.tournamentId,
        });

        // TODO: Add participants to the discipline
        // This would require matching or creating players and adding them to the discipline

        this.processedDisciplineKeys.set([...this.processedDisciplineKeys(), disciplineKey]);
        this.uploading.set(false);
        this.stepper.next();
      } catch (error) {
        console.error('Error importing discipline:', error);
        this.uploading.set(false);

        // Set error message
        if (error instanceof Error) {
          this.importError.set(error.message);
        } else {
          this.importError.set('IMPORT_ERROR');
        }
      }
    }
  }

  private determineDisciplineGender(participants: InsertPlayer[][]): DisciplineGender {
    // Get all unique genders from all players in the discipline
    const genders = new Set<string>();
    participants.forEach((entry) => {
      entry.forEach((player) => {
        if (player.gender === 'M') {
          genders.add('male');
        } else if (player.gender === 'W') {
          genders.add('female');
        }
      });
    });

    if (genders.size === 2) {
      return DisciplineGender.Mixed;
    } else if (genders.has('male')) {
      return DisciplineGender.Male;
    } else {
      return DisciplineGender.Female;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getEditedDisciplineName(originalKey: string): string {
    return this.editedDisciplineNames().get(originalKey) || originalKey;
  }

  onDisciplineNameChange(originalKey: string, newName: string) {
    const updatedNames = new Map(this.editedDisciplineNames());
    updatedNames.set(originalKey, newName);
    this.editedDisciplineNames.set(updatedNames);
    // Clear any import error when user starts editing
    this.importError.set(null);
  }
}
