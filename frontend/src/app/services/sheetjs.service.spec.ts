import { TestBed } from '@angular/core/testing';
import { SheetJsService } from './sheetjs.service';

describe('SheetJsService', () => {
  let service: SheetJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('jsonToCsvString', () => {
    it('should convert JSON to CSV string with headers', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'London' },
      ];

      const csvString = service.jsonToCsvString(data);

      expect(csvString).toContain('name');
      expect(csvString).toContain('age');
      expect(csvString).toContain('city');
      expect(csvString).toContain('John');
      expect(csvString).toContain('Jane');
    });

    it('should convert JSON to CSV string without headers', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const csvString = service.jsonToCsvString(data, true);

      expect(csvString).not.toContain('name');
      expect(csvString).not.toContain('age');
      expect(csvString).toContain('John');
      expect(csvString).toContain('Jane');
    });
  });

  describe('parseCsvString', () => {
    it('should parse CSV string with headers', () => {
      const csvString = 'name,age,city\nJohn,30,New York\nJane,25,London';

      const data = service.parseCsvString(csvString);

      expect(data.length).toBe(2);
      expect(data[0]).toEqual({ name: 'John', age: '30', city: 'New York' });
      expect(data[1]).toEqual({ name: 'Jane', age: '25', city: 'London' });
    });

    it('should parse CSV string without headers', () => {
      const csvString = 'John,30,New York\nJane,25,London';

      const data = service.parseCsvString(csvString, false);

      expect(data.length).toBe(2);
      expect(data[0]).toBeDefined();
      expect(data[1]).toBeDefined();
    });
  });

  describe('validateFileType', () => {
    it('should validate CSV file type', () => {
      const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      const isValid = service.validateFileType(csvFile);

      expect(isValid).toBe(true);
    });

    it('should validate Excel file type', () => {
      const excelFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const isValid = service.validateFileType(excelFile);

      expect(isValid).toBe(true);
    });

    it('should reject invalid file type', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const isValid = service.validateFileType(invalidFile);

      expect(isValid).toBe(false);
    });

    it('should validate with custom allowed types', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const isValid = service.validateFileType(pdfFile, ['application/pdf']);

      expect(isValid).toBe(true);
    });
  });

  describe('importFromCsv', () => {
    it('should import CSV file', async () => {
      const csvContent = 'name,age,city\nJohn,30,New York\nJane,25,London';
      const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });

      const result = await service.importFromCsv(csvFile);

      expect(result.data.length).toBe(2);
      expect(result.headers).toBeDefined();
      expect(result.headers?.length).toBe(3);
      expect(result.sheetNames.length).toBeGreaterThan(0);
    });

    it('should handle empty CSV file', async () => {
      const csvFile = new File([''], 'empty.csv', { type: 'text/csv' });

      const result = await service.importFromCsv(csvFile);

      expect(result.data.length).toBe(0);
    });
  });
});

