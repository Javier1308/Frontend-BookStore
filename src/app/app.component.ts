// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './shared/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header *ngIf="isAuthenticated"></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  
  isAuthenticated = false;

  ngOnInit() {
    this.checkAuth();
  }

  private checkAuth() {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
    
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    }
  }
}