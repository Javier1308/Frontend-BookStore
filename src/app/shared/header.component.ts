// src/app/shared/header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <a routerLink="/" class="text-2xl font-bold text-blue-600">BookStore</a>
          </div>
          
          <!-- Centered Navigation -->
          <div class="flex-1 flex justify-center">
            <div class="flex items-center space-x-8">
              <a routerLink="/" class="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a routerLink="/books" class="text-gray-700 hover:text-blue-600 transition-colors">Books</a>
              
              <div *ngIf="isAuthenticated" class="flex items-center space-x-8">
                <a routerLink="/cart" class="text-gray-700 hover:text-blue-600 transition-colors">Cart</a>
                <a routerLink="/favorites" class="text-gray-700 hover:text-blue-600 transition-colors">Favorites</a>
                <a routerLink="/wishlist" class="text-gray-700 hover:text-blue-600 transition-colors">Wishlist</a>
                <a routerLink="/orders" class="text-gray-700 hover:text-blue-600 transition-colors">Orders</a>
                <a routerLink="/profile" class="text-gray-700 hover:text-blue-600 transition-colors">Profile</a>
              </div>
            </div>
          </div>
          
          <!-- Right Side - Logout Button -->
          <div class="flex items-center">
            <div *ngIf="isAuthenticated; else authLinks">
              <button 
                (click)="logout()"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Logout
              </button>
            </div>
            
            <ng-template #authLinks>
              <a routerLink="/auth" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Login</a>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);

  get isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  logout() {
    this.apiService.logout();
    this.showMessage('Logged out successfully', 'success');
    this.router.navigate(['/auth']);
  }

  private showMessage(message: string, type: 'success' | 'error') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
}