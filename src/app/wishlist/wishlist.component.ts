import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

// Interface for wishlist items
interface WishlistItem {
  book_id: string;
  title: string;
  author: string;
  price?: number;
  image_url?: string;
  isbn?: string;
  category?: string;
  stock?: number;
  description?: string;
  added_at: string;
  created_at?: string;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Wishlist</h1>
        <div class="flex space-x-4">
          <!-- Sort dropdown -->
          <select 
            [(ngModel)]="sortBy" 
            (change)="sortWishlist()"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="price">Sort by Price</option>
          </select>
          
          <!-- Clear all button -->
          <button 
            *ngIf="wishlistItems.length > 0"
            (click)="clearWishlist()"
            [disabled]="removing"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ removing ? 'Clearing...' : 'Clear All' }}
          </button>
          
          <button 
            (click)="goBack()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Books
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && wishlistItems.length === 0" class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
        </svg>
        <p class="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
        <button 
          (click)="goBack()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Browse Books
        </button>
      </div>

      <div *ngIf="!loading && wishlistItems.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let item of wishlistItems; trackBy: trackByBookId" 
               class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h3>
              <p class="text-gray-600 mb-2">by {{ item.author }}</p>
              <p *ngIf="item.price" class="text-lg font-bold text-green-600 mb-2">\${{ item.price.toFixed(2) }}</p>
              <p class="text-sm text-gray-500 mb-4">Added: {{ formatDate(item.added_at || item.created_at || '') }}</p>
              
              <div class="flex space-x-2 mb-3">
                <button 
                  (click)="viewBook(item.book_id)"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button 
                  (click)="addToCart(item.book_id)"
                  [disabled]="addingToCart"
                  class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
                </button>
              </div>
              
              <!-- Remove from wishlist button -->
              <button 
                (click)="removeFromWishlist(item.book_id)"
                [disabled]="removing"
                class="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ removing ? 'Removing...' : 'Remove from Wishlist' }}
              </button>
            </div>
          </div>
        </div>

        <!-- API Limitation Notice -->
        <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="text-sm text-yellow-800">
                <strong>API Limitation:</strong> The Users API doesn't support individual wishlist item removal or clearing all items. 
                Wishlist items can only be added, not removed through the current API endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  wishlistItems: WishlistItem[] = [];
  loading = false;
  addingToCart = false;
  removing = false;
  sortBy: 'newest' | 'oldest' | 'title' | 'author' | 'price' = 'newest';

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    this.apiService.getWishlist(1, 100).subscribe({
      next: (response) => {
        this.wishlistItems = response.items || [];
        this.sortWishlist();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.showMessage('Error loading wishlist', 'error');
        this.loading = false;
      }
    });
  }

  viewBook(bookId: string) {
    this.router.navigate(['/book', bookId]);
  }

  addToCart(bookId: string) {
    if (!this.apiService.isAuthenticated()) {
      this.showMessage('Please login to add items to cart', 'error');
      return;
    }

    this.addingToCart = true;
    this.apiService.addToCart(bookId, 1).subscribe({
      next: (response) => {
        this.showMessage('Item added to cart successfully!', 'success');
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showMessage('Error adding item to cart', 'error');
        this.addingToCart = false;
      }
    });
  }

  removeFromWishlist(bookId: string) {
    // Since the API doesn't support removal, we'll simulate it locally
    // In a real implementation, this would make an API call
    this.showMessage('API limitation: Cannot remove individual items from wishlist', 'warning');
    
    // Simulate removal for UI purposes (this won't persist)
    // this.wishlistItems = this.wishlistItems.filter(item => item.book_id !== bookId);
    // this.showMessage('Item removed from wishlist (local only)', 'success');
  }

  clearWishlist() {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    this.removing = true;
    // Since the API doesn't support clearing, we'll simulate it locally
    setTimeout(() => {
      this.wishlistItems = [];
      this.removing = false;
      this.showMessage('Wishlist cleared (local only - API limitation)', 'warning');
    }, 1000);
  }

  sortWishlist() {
    switch (this.sortBy) {
      case 'newest':
        this.wishlistItems.sort((a, b) => {
          const dateA = new Date(a.added_at || a.created_at || '').getTime();
          const dateB = new Date(b.added_at || b.created_at || '').getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest':
        this.wishlistItems.sort((a, b) => {
          const dateA = new Date(a.added_at || a.created_at || '').getTime();
          const dateB = new Date(b.added_at || b.created_at || '').getTime();
          return dateA - dateB;
        });
        break;
      case 'title':
        this.wishlistItems.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        this.wishlistItems.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'price':
        this.wishlistItems.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
    }
  }

  goBack() {
    this.router.navigate(['/books']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  }

  trackByBookId(index: number, item: WishlistItem): string {
    return item.book_id;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning') {
    const notification = document.createElement('div');
    let bgColor = 'bg-green-500';
    
    switch (type) {
      case 'error':
        bgColor = 'bg-red-500';
        break;
      case 'warning':
        bgColor = 'bg-yellow-500';
        break;
      default:
        bgColor = 'bg-green-500';
    }
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }
}