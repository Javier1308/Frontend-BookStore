// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookCardComponent } from '../shared/book-card.component';

interface Book {
  book_id: string;
  isbn: string;
  title: string;
  author: string;
  editorial: string;
  category: string;
  price: number;
  description: string;
  cover_image_url: string;
  stock_quantity: number;
  publication_year: number;
  language: string;
  pages: number;
  rating: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface RecommendationsResponse {
  recommendations: Book[];
  total: number;
  based_on: string;
}

interface UserAnalytics {
  summary: {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    completed_orders: number;
    pending_orders: number;
  };
  monthly_stats: any;
  generated_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BookCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome back, {{getUserName()}}!</h1>
        <p class="text-gray-600">Discover your next favorite book</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Available Books</p>
              <p class="text-2xl font-bold text-gray-800">{{totalBooks}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2a1 1 0 00.9 1.8h10.8"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Cart Items</p>
              <p class="text-2xl font-bold text-gray-800">{{cartItems}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-bold text-gray-800">{{analytics?.summary?.total_orders || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Spent</p>
              <p class="text-2xl font-bold text-gray-800">\${{analytics?.summary?.total_spent || 0}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          (click)="navigateTo('/books')"
          class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
          <div class="flex items-center">
            <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <div class="text-left">
              <h3 class="text-lg font-semibold">Browse Books</h3>
              <p class="text-blue-100">Explore our collection</p>
            </div>
          </div>
        </button>

        <button 
          (click)="navigateTo('/cart')"
          class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
          <div class="flex items-center">
            <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2a1 1 0 00.9 1.8h10.8"></path>
            </svg>
            <div class="text-left">
              <h3 class="text-lg font-semibold">View Cart</h3>
              <p class="text-green-100">{{cartItems}} items waiting</p>
            </div>
          </div>
        </button>

        <button 
          (click)="navigateTo('/profile')"
          class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
          <div class="flex items-center">
            <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <div class="text-left">
              <h3 class="text-lg font-semibold">My Profile</h3>
              <p class="text-purple-100">Orders & settings</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Recommendations -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Recommended for You</h2>
          <button 
            (click)="navigateTo('/books')"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Books →
          </button>
        </div>
        
        <div *ngIf="recommendationsLoading" class="flex justify-center items-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div *ngIf="!recommendationsLoading && recommendations.length === 0" class="text-center py-8 bg-white rounded-lg shadow-md">
          <svg class="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"></path>
          </svg>
          <p class="text-gray-500">No recommendations available</p>
          <button 
            (click)="loadRecommendations()"
            class="mt-2 text-blue-600 hover:text-blue-800 text-sm">
            Try Again
          </button>
        </div>
        
        <div *ngIf="!recommendationsLoading && recommendations.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-book-card 
            *ngFor="let book of recommendations" 
            [book]="transformBook(book)">
          </app-book-card>
        </div>
      </div>

      <!-- Categories -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Browse by Category</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <button 
            *ngFor="let category of categories" 
            (click)="browseCategory(category)"
            class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer text-center group">
            <h3 class="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{{category}}</h3>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  totalBooks = 0;
  cartItems = 0;
  recommendations: Book[] = [];
  categories: string[] = [];
  analytics: UserAnalytics | null = null;
  recommendationsLoading = false;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadRecommendations();
    this.loadCategories();
    this.loadUserAnalytics();
    this.loadCartInfo();
  }

  loadRecommendations() {
    this.recommendationsLoading = true;
    const token = localStorage.getItem('token');
    const url = `https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev/api/v1/books/recommendations?tenant_id=tenant1&limit=8`;
    
    this.http.get<RecommendationsResponse>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations || [];
        this.totalBooks = response.total || this.recommendations.length;
        this.recommendationsLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.recommendationsLoading = false;
        // Set some default data
        this.totalBooks = 1200;
      }
    });
  }

  loadCategories() {
    const token = localStorage.getItem('token');
    const url = `https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev/api/v1/books/categories?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.categories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Fallback categories
        this.categories = ["Literatura", "Technology", "Ficción", "Testing", "Clásicos"];
      }
    });
  }

  loadUserAnalytics() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.user_id) return;

    const url = `https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/analytics/purchases?user_id=${user.user_id}&tenant_id=${user.tenant_id || 'tenant1'}`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.analytics = response.analytics;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  loadCartInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.user_id) return;

    const url = `https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/cart?user_id=${user.user_id}&tenant_id=${user.tenant_id || 'tenant1'}`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.cartItems = response.item_count || 0;
      },
      error: (error) => {
        console.error('Error loading cart info:', error);
        this.cartItems = 0;
      }
    });
  }

  getUserName(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.first_name || user.username || 'User';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  browseCategory(category: string) {
    this.router.navigate(['/books'], { queryParams: { category } });
  }

  // Transform Books API format to BookCard component format
  transformBook(apiBook: Book): any {
    return {
      id: apiBook.book_id,
      title: apiBook.title,
      author: apiBook.author,
      isbn: apiBook.isbn,
      category: apiBook.category,
      price: apiBook.price,
      description: apiBook.description,
      image_url: apiBook.cover_image_url,
      stock: apiBook.stock_quantity,
      created_at: apiBook.created_at,
      updated_at: apiBook.updated_at
    };
  }
}