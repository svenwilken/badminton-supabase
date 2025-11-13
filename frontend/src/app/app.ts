import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  currentLanguage = signal('en');

  constructor(private translate: TranslateService) {
    // Set default language
    translate.setFallbackLang('en');

    // Try to get saved language from localStorage
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage.set(savedLang);
    translate.use(savedLang);
  }

  ngOnInit() {
    // Update title when language changes
    this.translate.onLangChange.subscribe(() => {
      // Title will be updated via the translate pipe in the template
    });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  getLanguageName(lang: string): string {
    return lang === 'en' ? 'English' : 'Deutsch';
  }
}
