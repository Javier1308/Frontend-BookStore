// src/app/shared/header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">BookStore Pro</h1>
          </div>

          <nav class="hidden md:flex space-x-8">
            <a routerLink="/dashboard" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
            <a routerLink="/books" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Books</a>
            <a routerLink="/cart" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Cart</a>
            <a routerLink="/favorites" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Favorites</a>
            <a routerLink="/wishlist" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Wishlist</a>
            <a routerLink="/profile" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Profile</a>
            <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="text-blue-600" class="text-gray-700 hover:text-blue-600 transition-colors">Admin</a>
          </nav>

          <div class="flex items-center space-x-4">
            <a routerLink="/favorites" class="relative p-2 text-gray-700 hover:text-blue-600" title="Favorites">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </a>

            <a routerLink="/wishlist" class="relative p-2 text-gray-700 hover:text-blue-600" title="Wishlist">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
            </a>

            <button (click)="toggleCart()" class="relative p-2 text-gray-700 hover:text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2a1 1 0 00.9 1.8h10.8m-2.4-6.8a1 1 0 100 2 1 1 0 000-2zm-7.2 0a1 1 0 100 2 1 1 0 000-2z"></path>
              </svg>
              <span *ngIf="cartCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{cartCount}}
              </span>
            </button>

            <button (click)="toggleMobileMenu()" class="md:hidden p-2 text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <button (click)="logout()" class="text-gray-700 hover:text-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div *ngIf="mobileMenuOpen" class="md:hidden py-4 border-t">
          <nav class="space-y-2">
            <a routerLink="/dashboard" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Dashboard</a>
            <a routerLink="/books" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Books</a>
            <a routerLink="/cart" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Cart</a>
            <a routerLink="/favorites" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Favorites</a>
            <a routerLink="/wishlist" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Wishlist</a>
            <a routerLink="/profile" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Profile</a>
            <a *ngIf="isAdmin" routerLink="/admin" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Admin</a>
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private router = inject(Router);
  
  mobileMenuOpen = false;
  cartCount = 0;
  isAdmin = false;

  constructor() {
    this.checkUserRole();
  }

  checkUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.role === 'admin' || user.role === 'super_admin';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }
}