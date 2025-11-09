import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  skipHeader?: boolean;
  dateFormat?: string;
}

export interface ImportOptions {
  hasHeader?: boolean;
  sheetIndex?: number;
  sheetName?: string;
  raw?: boolean;
}

export interface ImportResult<T> {
  data: T[];
  headers?: string[];
  sheetNames: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SheetJsService {
  constructor() {}

  /**
   * Export data to CSV file
   * @param data Array of objects to export
   * @param options Export options
   */
  exportToCsv<T>(data: T[], options: ExportOptions = {}): void {
    const { filename = 'export.csv', sheetName = 'Sheet1', skipHeader = false } = options;

    // Convert data to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      skipHeader,
    });

    // Create workbook
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate CSV file and trigger download
    XLSX.writeFile(workbook, this.ensureExtension(filename, 'csv'), {
      bookType: 'csv',
    });
  }

  /**
   * Export data to Excel file (XLSX format)
   * @param data Array of objects to export
   * @param options Export options
   */
  exportToExcel<T>(data: T[], options: ExportOptions = {}): void {
    const { filename = 'export.xlsx', sheetName = 'Sheet1', skipHeader = false } = options;

    // Convert data to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      skipHeader,
    });

    // Auto-size columns
    this.autoSizeColumns(worksheet, data);

    // Create workbook
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, this.ensureExtension(filename, 'xlsx'));
  }

  /**
   * Export multiple sheets to Excel file
   * @param sheets Object with sheet names as keys and data arrays as values
   * @param filename Output filename
   */
  exportMultipleSheets<T>(
    sheets: { [sheetName: string]: T[] },
    filename: string = 'export.xlsx',
  ): void {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, data]) => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      this.autoSizeColumns(worksheet, data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, this.ensureExtension(filename, 'xlsx'));
  }

  /**
   * Import CSV file
   * @param file File to import
   * @param options Import options
   * @returns Promise with parsed data
   */
  importFromCsv<T = any>(file: File, options: ImportOptions = {}): Promise<ImportResult<T>> {
    return this.importFile<T>(file, { ...options, raw: false });
  }

  /**
   * Import Excel file (XLSX format)
   * @param file File to import
   * @param options Import options
   * @returns Promise with parsed data
   */
  importFromExcel<T = any>(file: File, options: ImportOptions = {}): Promise<ImportResult<T>> {
    return this.importFile<T>(file, options);
  }

  /**
   * Import file (generic method for CSV and Excel)
   * @param file File to import
   * @param options Import options
   * @returns Promise with parsed data
   */
  private importFile<T = any>(file: File, options: ImportOptions = {}): Promise<ImportResult<T>> {
    return new Promise((resolve, reject) => {
      const { hasHeader = true, sheetIndex = 0, sheetName, raw = false } = options;

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook: XLSX.WorkBook = XLSX.read(data, {
            type: 'binary',
            cellDates: true,
            raw,
          });

          // Get sheet names
          const sheetNames = workbook.SheetNames;

          // Determine which sheet to use
          let worksheet: XLSX.WorkSheet;
          if (sheetName && sheetNames.includes(sheetName)) {
            worksheet = workbook.Sheets[sheetName];
          } else if (sheetIndex < sheetNames.length) {
            worksheet = workbook.Sheets[sheetNames[sheetIndex]];
          } else {
            reject(new Error('Sheet not found'));
            return;
          }

          // Convert sheet to JSON
          const jsonData: T[] = XLSX.utils.sheet_to_json(worksheet, {
            header: hasHeader ? undefined : 1,
            raw: false,
            defval: '',
          });

          // Extract headers if needed
          let headers: string[] | undefined;
          if (hasHeader) {
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            headers = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
              const cell = worksheet[cellAddress];
              headers.push(cell ? String(cell.v) : `Column${col + 1}`);
            }
          }

          resolve({
            data: jsonData,
            headers,
            sheetNames,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Convert CSV string to JSON
   * @param csvString CSV string to parse
   * @param hasHeader Whether the CSV has a header row
   * @returns Parsed data
   */
  parseCsvString<T = any>(csvString: string, hasHeader: boolean = true): T[] {
    const workbook = XLSX.read(csvString, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet, {
      header: hasHeader ? undefined : 1,
      raw: false,
      defval: '',
    });
  }

  /**
   * Convert JSON to CSV string
   * @param data Array of objects to convert
   * @param skipHeader Whether to skip the header row
   * @returns CSV string
   */
  jsonToCsvString<T>(data: T[], skipHeader: boolean = false): string {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      skipHeader,
    });
    return XLSX.utils.sheet_to_csv(worksheet);
  }

  /**
   * Validate file type
   * @param file File to validate
   * @param allowedTypes Allowed MIME types
   * @returns Whether the file is valid
   */
  validateFileType(
    file: File,
    allowedTypes: string[] = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  ): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Get file extension
   * @param filename Filename
   * @returns File extension
   */
  private getExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  /**
   * Ensure filename has the correct extension
   * @param filename Original filename
   * @param extension Desired extension
   * @returns Filename with correct extension
   */
  private ensureExtension(filename: string, extension: string): string {
    const currentExt = this.getExtension(filename);
    if (currentExt.toLowerCase() === extension.toLowerCase()) {
      return filename;
    }
    return `${filename}.${extension}`;
  }

  /**
   * Auto-size columns based on content
   * @param worksheet Worksheet to modify
   * @param data Data array
   */
  private autoSizeColumns<T>(worksheet: XLSX.WorkSheet, data: T[]): void {
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0] as object);
    const colWidths = keys.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => {
          const value = (row as any)[key];
          return value ? String(value).length : 0;
        }),
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
    });

    worksheet['!cols'] = colWidths;
  }
}
