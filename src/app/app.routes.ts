import { Routes } from '@angular/router';
import { FragmentComponent } from './pages/fragment/fragment.component';
import { HomeComponent } from './pages/home/home.component';
import { PredictComponent } from './pages/predict/predict.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'predict', component: PredictComponent },
  { path: 'fragment', component: FragmentComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' },
];
