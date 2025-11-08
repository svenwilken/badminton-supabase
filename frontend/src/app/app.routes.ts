import { Routes } from '@angular/router';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { PlayersListComponent } from './pages/players-list/players-list.component';
import { TournamentDetailComponent } from './pages/tournament-detail/tournament-detail.component';
import { OverviewTabComponent } from './pages/tournament-detail/tabs/overview-tab/overview-tab.component';
import { DisciplinesTabComponent } from './pages/tournament-detail/tabs/disciplines-tab/disciplines-tab.component';
import { MatchesTabComponent } from './pages/tournament-detail/tabs/matches-tab/matches-tab.component';
import { SettingsTabComponent } from './pages/tournament-detail/tabs/settings-tab/settings-tab.component';
import { DisciplineDetailComponent } from './pages/discipline-detail/discipline-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: TournamentListComponent
  },
  {
    path: 'players',
    component: PlayersListComponent
  },
  {
    path: 'tournament/:id',
    component: TournamentDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewTabComponent
      },
      {
        path: 'disciplines',
        component: DisciplinesTabComponent
      },
      {
        path: 'matches',
        component: MatchesTabComponent
      },
      {
        path: 'settings',
        component: SettingsTabComponent
      }
    ]
  },
  {
    path: 'tournament/:tournamentId/discipline/:disciplineId',
    component: DisciplineDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
