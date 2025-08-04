import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MusicRecommendationComponent } from './components/music-recommendation/music-recommendation.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'music-recommendation', component: MusicRecommendationComponent },
  { path: '', redirectTo: '/music-recommendation', pathMatch: 'full' },
  { path: '**', redirectTo: '/music-recommendation' }
];
