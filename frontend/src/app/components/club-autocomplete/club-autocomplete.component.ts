import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-club-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    TranslateModule
  ],
  templateUrl: './club-autocomplete.component.html',
  styleUrl: './club-autocomplete.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClubAutocompleteComponent),
      multi: true
    }
  ]
})
export class ClubAutocompleteComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = 'CLUB.PLACEHOLDER';
  @Input() label: string = 'CLUB.LABEL';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() disabled: boolean = false;
  @Input() cssClass: string = '';

  allClubs: string[] = [];
  filteredClubs: string[] = [];
  
  private _value: string = '';
  
  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadClubs();
  }

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  async loadClubs() {
    try {
      this.allClubs = await this.supabaseService.getDistinctClubs();
      this.filteredClubs = this.allClubs;
    } catch (err) {
      console.error('Error loading clubs:', err);
    }
  }

  filterClubs(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredClubs = this.allClubs.filter(club => 
      club.toLowerCase().includes(filterValue)
    );
  }

  onInput(value: string) {
    this.value = value;
    this.filterClubs(value);
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this._value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

