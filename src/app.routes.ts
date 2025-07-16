// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from './app/auth/auth.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { BooksComponent } from './app/books/books.component';
import { CartComponent } from './app/cart/cart.component';
import { ProfileComponent } from './app/profile/profile.component';
import { BookDetailComponent } from './app/book-detail/book-detail.component';
import { FavoritesComponent } from './app/favorites/favorites.component';
import { WishlistComponent } from './app/wishlist/wishlist.component';
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
    path: 'book/:id', 
    component: BookDetailComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'favorites', 
    component: FavoritesComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'wishlist', 
    component: WishlistComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];