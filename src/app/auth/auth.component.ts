// src/app/auth/auth.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Sign in to your account' : 'Create your account' }}
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form (ngSubmit)="onSubmit()" #authForm="ngForm">
            <div *ngIf="!isLogin">
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                [(ngModel)]="formData.username"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div *ngIf="!isLogin" class="mt-6">
              <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName"
                [(ngModel)]="formData.first_name"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div *ngIf="!isLogin" class="mt-6">
              <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName"
                [(ngModel)]="formData.last_name"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div [class.mt-6]="!isLogin">
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                [(ngModel)]="formData.email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div class="mt-6">
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                [(ngModel)]="formData.password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div class="mt-6">
              <button 
                type="submit" 
                [disabled]="loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up') }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <button 
              type="button" 
              (click)="toggleMode()"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {{ isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  isLogin = true;
  loading = false;
  
  formData = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  };

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    if (this.loading) return;

    this.loading = true;

    if (this.isLogin) {
      this.apiService.login(this.formData.email, this.formData.password).subscribe({
        next: (response) => {
          this.router.navigate(['/']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          alert('Login failed');
          this.loading = false;
        }
      });
    } else {
      this.apiService.register(this.formData).subscribe({
        next: (response) => {
          this.router.navigate(['/']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Register error:', error);
          alert('Registration failed');
          this.loading = false;
        }
      });
    }
  }
}