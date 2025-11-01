import { Routes } from '@angular/router';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { PlayersListComponent } from './pages/players-list/players-list.component';

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
    path: '**',
    redirectTo: ''
  }
];
