import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../services/supabase.service';
import { Tournament } from '../../../shared/supabase.types';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-tournament-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.scss',
})
export class TournamentDetailComponent implements OnInit {
  tournament = signal<Tournament | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  tournamentId: string | null = null;

  navItems: NavItem[] = [
    { label: 'TOURNAMENT_DETAIL.TABS.OVERVIEW', route: 'overview', icon: 'dashboard' },
    { label: 'TOURNAMENT_DETAIL.TABS.DISCIPLINES', route: 'disciplines', icon: 'category' },
    { label: 'TOURNAMENT_DETAIL.TABS.MATCHES', route: 'matches', icon: 'sports' },
    { label: 'TOURNAMENT_DETAIL.TABS.SETTINGS', route: 'settings', icon: 'settings' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.tournamentId = params.get('id');
      if (this.tournamentId) {
        await this.loadTournament();
      }
    });
  }

  async loadTournament() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const tournaments = await this.supabaseService.getTournaments();
      const tournament = tournaments.find((t) => t.id === this.tournamentId);

      if (tournament) {
        this.tournament.set(tournament);
      } else {
        this.error.set(this.translate.instant('TOURNAMENT_DETAIL.ERROR_NOT_FOUND'));
      }
    } catch (err: any) {
      console.error('Error loading tournament:', err);
      this.error.set(err.message || this.translate.instant('TOURNAMENT_DETAIL.ERROR_LOADING'));
    } finally {
      this.loading.set(false);
    }
  }

  navigateBack() {
    this.router.navigate(['/']);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
