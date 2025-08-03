import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/music-recommendation/music-recommendation.component'
      ).then((m) => m.MusicRecommendationComponent),
  },
  {
    path: 'music-recommendation',
    loadComponent: () =>
      import(
        './components/music-recommendation/music-recommendation.component'
      ).then((m) => m.MusicRecommendationComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
