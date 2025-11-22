import { Component, Inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { SheetJsService } from '../../services/sheetjs.service';
import { ImportData, ImportDataSchema } from './model/import.model';
import z from 'zod';
import { ImportService } from '../../services/data-import/data-import.service';
import { ParsedImportData } from '../../../shared/import.type';

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

  constructor(
    public dialogRef: MatDialogRef<ImportDisciplinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDialogData,
    private sheetJsService: SheetJsService,
    private importService: ImportService,
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
    this.disciplineKeys.set(Object.keys(parsedImportData));
    this.uploading.set(false);
  }

  onImportDiscipline() {
    const index = this.stepper.selectedIndex;
    if (index !== undefined) {
      const disciplineKey = this.disciplineKeys()[index];
      const discipline = this.parsedImportData()![disciplineKey];

      this.processedDisciplineKeys.set([...this.processedDisciplineKeys(), disciplineKey]);
      this.stepper.next();
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
}
