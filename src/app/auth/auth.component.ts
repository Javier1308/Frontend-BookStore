// src/app/auth/auth.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-xl shadow-2xl p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">BookStore Pro</h1>
            <p class="text-gray-600">{{isLogin ? 'Welcome back!' : 'Create your account'}}</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div *ngIf="!isLogin" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.username" 
                  name="username"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.first_name" 
                    name="first_name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.last_name" 
                    name="last_name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                <input 
                  type="tel" 
                  [(ngModel)]="formData.phone" 
                  name="phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                [(ngModel)]="formData.email" 
                name="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                [(ngModel)]="formData.password" 
                name="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required>
            </div>

            <div *ngIf="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600 text-sm">{{error}}</p>
            </div>

            <button 
              type="submit" 
              [disabled]="loading"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}}
            </button>
          </form>

          <div class="mt-6 text-center">
            <button 
              (click)="toggleMode()"
              class="text-blue-600 hover:text-blue-800 text-sm">
              {{isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  isLogin = true;
  loading = false;
  error = '';

  formData = {
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: ''
  };

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    // Reset form data when switching modes
    if (this.isLogin) {
      this.formData = {
        email: this.formData.email,
        password: '',
        username: '',
        first_name: '',
        last_name: '',
        phone: ''
      };
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  private login() {
    // Users API Login - requiere solo email y password
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/login?tenant_id=tenant1`;
    
    const loginData = {
      email: this.formData.email,
      password: this.formData.password
    };

    this.http.post(url, loginData).subscribe({
      next: (response: any) => {
        // Guardar token y usuario según formato de respuesta de Users API
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.error?.error || error.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  private register() {
    // Users API Register - requiere username, email, password, first_name, last_name
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/register?tenant_id=tenant1`;
    
    const registerData = {
      username: this.formData.username,
      email: this.formData.email,
      password: this.formData.password,
      first_name: this.formData.first_name,
      last_name: this.formData.last_name,
      ...(this.formData.phone && { phone: this.formData.phone })
    };

    this.http.post(url, registerData).subscribe({
      next: (response: any) => {
        // Guardar token y usuario según formato de respuesta de Users API
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Register error:', error);
        this.error = error.error?.error || error.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}