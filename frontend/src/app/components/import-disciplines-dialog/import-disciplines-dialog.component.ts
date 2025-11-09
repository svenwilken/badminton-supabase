import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { SheetJsService } from '../../services/sheetjs.service';
import { ImportData, ImportDataSchema } from './model/import.model';
import z from 'zod';

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
    TranslateModule,
  ],
  templateUrl: './import-disciplines-dialog.component.html',
  styleUrl: './import-disciplines-dialog.component.scss',
})
export class ImportDisciplinesDialogComponent {
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  dragOver = signal(false);
  validationErrors = signal<z.core.$ZodIssue[] | null>(null);

  constructor(
    public dialogRef: MatDialogRef<ImportDisciplinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDialogData,
    private sheetJsService: SheetJsService,
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

    let { data } = file.type.includes('csv')
      ? await this.sheetJsService.importFromCsv(file)
      : await this.sheetJsService.importFromExcel(file);

    data = data.filter((row) => row['Partner Name'] !== 'Freimeldung'); // remove freimeldung row

    const parsedData = ImportDataSchema.safeParse(data);
    if (!parsedData.success) {
      this.validationErrors.set(parsedData.error.issues);
      this.selectedFile.set(null);
      throw new Error('Invalid file');
    }

    // Clear validation errors on success
    this.validationErrors.set(null);
    this.selectedFile.set(file);
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

    // TODO: Implement actual import logic
    // For now, just simulate upload
    setTimeout(() => {
      this.uploading.set(false);
      this.dialogRef.close({ success: true, file: this.selectedFile() });
    }, 2000);
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
