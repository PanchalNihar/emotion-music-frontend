import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MusicRecommendationComponent } from './components/music-recommendation/music-recommendation.component';
import { MoodHistoryComponent } from './components/mood-tune/pages/mood-history/mood-history.component';
import { PreferencesComponent } from './components/mood-tune/pages/preferences/preferences.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'music-recommendation', component: MusicRecommendationComponent },
  { path: 'mood-history', component: MoodHistoryComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: '**', redirectTo: '/music-recommendation' },
  { path: '', redirectTo: '/music-recommendation', pathMatch: 'full' },
];
