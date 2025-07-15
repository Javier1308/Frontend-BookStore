// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from './app/auth/auth.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { BooksComponent } from './app/books/books.component';
import { CartComponent } from './app/cart/cart.component';
import { ProfileComponent } from './app/profile/profile.component';
import { authGuard, adminGuard } from './app/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'books', 
    component: BooksComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];