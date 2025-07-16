import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookCardComponent } from '../shared/book-card.component';
import { LoadingComponent } from '../shared/loading.component';
import { ErrorComponent } from '../shared/error.component';

interface WishlistItem {
  id: string;
  book_id: string;
  title: string;
  author: string;
  price?: number;
  image_url?: string;
  isbn?: string;
  category?: string;
  stock?: number;
  description?: string;
  created_at: string;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent, LoadingComponent, ErrorComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <button 
            *ngIf="wishlist.length > 0"
            (click)="clearAllWishlist()"
            [disabled]="loading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            Clear All
          </button>
        </div>

        <div *ngIf="loading" class="flex justify-center py-12">
          <app-loading></app-loading>
        </div>

        <div *ngIf="error" class="mb-6">
          <app-error [message]="error" (retry)="loadWishlist()"></app-error>
        </div>

        <div *ngIf="!loading && wishlist.length === 0" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            <h2 class="mt-4 text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p class="mt-2 text-gray-500">Save books for later by adding them to your wishlist!</p>
            <button 
              (click)="goToBooks()"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Books
            </button>
          </div>
        </div>

        <div *ngIf="!loading && wishlist.length > 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <p class="text-gray-600">{{wishlist.length}} item{{wishlist.length === 1 ? '' : 's'}} in your wishlist</p>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-600">Sort by:</label>
              <select 
                [(ngModel)]="sortBy" 
                (change)="sortWishlist()"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let item of wishlist" class="relative">
              <app-book-card 
                [book]="transformToBook(item)">
              </app-book-card>
              <button 
                (click)="removeFromWishlist(item.book_id)"
                [disabled]="removing"
                class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                title="Remove from wishlist">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  wishlist: WishlistItem[] = [];
  loading = false;
  removing = false;
  error = '';
  sortBy = 'newest';

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }

    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/wishlist?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.wishlist = response.items || [];
        this.sortWishlist();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.error = 'Failed to load wishlist. Please try again.';
        this.loading = false;
      }
    });
  }

  removeFromWishlist(bookId: string) {
    if (!confirm('Are you sure you want to remove this book from your wishlist?')) {
      return;
    }

    this.removing = true;
    const token = localStorage.getItem('token');
    
    // Since the API doesn't have a delete endpoint, we'll remove it from the local array
    // In a real application, you'd want to call a DELETE endpoint
    this.wishlist = this.wishlist.filter(item => item.book_id !== bookId);
    this.removing = false;
    
    this.showMessage('Removed from wishlist', 'success');
  }

  clearAllWishlist() {
    if (!confirm('Are you sure you want to clear all wishlist items?')) {
      return;
    }

    this.removing = true;
    this.wishlist = [];
    this.removing = false;
    
    this.showMessage('Wishlist cleared', 'success');
  }

  sortWishlist() {
    switch (this.sortBy) {
      case 'newest':
        this.wishlist.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        this.wishlist.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title':
        this.wishlist.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        this.wishlist.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'price':
        this.wishlist.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
    }
  }

  transformToBook(item: WishlistItem): any {
    return {
      id: item.book_id,
      title: item.title,
      author: item.author,
      price: item.price || 0,
      image_url: item.image_url,
      isbn: item.isbn,
      category: item.category,
      stock: item.stock || 0,
      description: item.description
    };
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }

  private showMessage(message: string, type: 'success' | 'error') {
    // Create and show temporary message
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 3000);
  }
}
