// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { HeaderComponent } from './shared/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Use HeaderComponent instead of duplicated navigation -->
      <app-header></app-header>

      <!-- Main Content -->
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  
  isAuthenticated = false;

  ngOnInit() {
    this.checkAuth();
    
    // Subscribe to authentication changes
    this.apiService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Remove any automatic redirects to dashboard
    // Don't redirect based on authentication state alone
  }

  private checkAuth() {
    this.isAuthenticated = this.apiService.isAuthenticated();
    
    // Only redirect to auth if trying to access protected routes and not authenticated
    // Don't automatically redirect to dashboard
  }

  logout() {
    // Call API service logout method
    this.apiService.logout();
    
    // Update authentication state
    this.isAuthenticated = false;
    
    // Show logout message
    this.showMessage('Logged out successfully', 'success');
    
    // Redirect to auth page
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