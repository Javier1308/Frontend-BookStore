// src/app/shared/book-card.component.ts
import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div class="relative">
        <img 
          [src]="getBookImage()" 
          [alt]="book.title"
          class="w-full h-48 object-cover"
          (error)="onImageError($event)">
        
        <!-- Stock Badge -->
        <div class="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          Stock: {{ getStockQuantity() }}
        </div>

        <!-- Action Icons - Top Left -->
        <div class="absolute top-2 left-2 flex space-x-2">
          <!-- Heart Icon for Favorites - Enhanced -->
          <button 
            (click)="toggleFavorite()"
            [disabled]="favoritesLoading"
            class="bg-white rounded-full p-2 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
            [class.text-red-500]="isFavorite"
            [class.text-gray-400]="!isFavorite"
            [class.bg-red-50]="isFavorite"
            [class.hover:bg-red-50]="!isFavorite && !favoritesLoading"
            [class.hover:text-red-500]="!isFavorite && !favoritesLoading"
            [title]="isFavorite ? 'Remove from favorites' : 'Add to favorites'">
            
            <!-- Filled heart when favorite -->
            <svg *ngIf="isFavorite && !favoritesLoading" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
            
            <!-- Outline heart when not favorite -->
            <svg *ngIf="!isFavorite && !favoritesLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            
            <!-- Loading spinner -->
            <div *ngIf="favoritesLoading" class="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          </button>

          <!-- TikTok-style Bookmark Flag for Wishlist -->
          <button 
            (click)="addToWishlist()"
            [disabled]="wishlistLoading"
            class="bg-white rounded-full p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110">
            <svg *ngIf="!wishlistLoading" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
            <div *ngIf="wishlistLoading" class="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          </button>
        </div>
      </div>
      
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{{ book.title }}</h3>
        <p class="text-gray-600 mb-2">by {{ book.author }}</p>
        <p class="text-sm text-gray-500 mb-3">{{ book.category }}</p>
        
        <div class="flex justify-between items-center mb-4">
          <span class="text-xl font-bold text-blue-600">\${{ getPrice() }}</span>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-sm text-gray-600">{{ getRating() }}</span>
          </div>
        </div>
        
        <button 
          (click)="viewDetails()"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  `
})
export class BookCardComponent implements OnInit {
  @Input() book: any;
  
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  isFavorite = false;
  favoritesLoading = false;
  wishlistLoading = false;
  private userFavorites: Set<string> = new Set();

  ngOnInit() {
    console.log('Book data received:', this.book);
    console.log('Book ID:', this.book?.book_id);
    console.log('Alternative ID:', this.book?.id);
    
    // Check if book_id exists, if not try to use id field
    if (!this.book?.book_id && this.book?.id) {
      this.book.book_id = this.book.id;
      console.log('Fixed book_id using id field:', this.book.book_id);
    }
    
    console.log('Final book_id for favorites:', this.book?.book_id);
    console.log('Is authenticated:', this.apiService.isAuthenticated());
    
    if (this.apiService.isAuthenticated()) {
      this.loadUserFavorites();
    }
  }

  private loadUserFavorites() {
    console.log('Loading user favorites...');
    this.apiService.getFavorites(1, 100).subscribe({
      next: (response) => {
        console.log('Favorites API response:', response);
        this.userFavorites.clear();
        if (response.items && response.items.length > 0) {
          response.items.forEach((fav: any) => {
            this.userFavorites.add(fav.book_id);
          });
        }
        console.log('User favorites set:', Array.from(this.userFavorites));
        
        // Make sure we have a valid book_id before checking favorites
        const bookId = this.book?.book_id || this.book?.id;
        this.isFavorite = bookId ? this.userFavorites.has(bookId) : false;
        console.log('Is this book favorite?', this.isFavorite, 'for book ID:', bookId);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
      }
    });
  }

  toggleFavorite() {
    const bookId = this.book?.book_id || this.book?.id;
    console.log('Toggle favorite clicked for book:', bookId);
    
    if (!this.apiService.isAuthenticated()) {
      this.showMessage('Please login to manage favorites', 'error');
      this.router.navigate(['/auth']);
      return;
    }

    if (!bookId) {
      console.error('Book ID is missing:', this.book);
      this.showMessage('Book ID is missing - cannot add to favorites', 'error');
      return;
    }

    this.favoritesLoading = true;
    console.log('Current favorite state:', this.isFavorite);

    if (this.isFavorite) {
      // Remove from favorites
      console.log('Removing from favorites:', bookId);
      this.apiService.removeFromFavorites(bookId).subscribe({
        next: (response) => {
          console.log('Remove favorite response:', response);
          this.isFavorite = false;
          this.userFavorites.delete(bookId);
          this.showMessage('Removed from favorites', 'success');
          this.favoritesLoading = false;
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.showMessage('Error removing from favorites', 'error');
          this.favoritesLoading = false;
        }
      });
    } else {
      // Add to favorites
      console.log('Adding to favorites:', bookId);
      this.apiService.addToFavorites(bookId).subscribe({
        next: (response) => {
          console.log('Add favorite response:', response);
          this.isFavorite = true;
          this.userFavorites.add(bookId);
          this.showMessage('Added to favorites!', 'success');
          this.favoritesLoading = false;
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.showMessage('Error adding to favorites', 'error');
          this.favoritesLoading = false;
        }
      });
    }
  }

  addToWishlist() {
    const bookId = this.book?.book_id || this.book?.id;
    
    if (!this.apiService.isAuthenticated()) {
      this.showMessage('Please login to manage wishlist', 'error');
      this.router.navigate(['/auth']);
      return;
    }

    if (!bookId) {
      console.error('Book ID is missing for wishlist:', this.book);
      this.showMessage('Book ID is missing - cannot add to wishlist', 'error');
      return;
    }

    this.wishlistLoading = true;
    this.apiService.addToWishlist(bookId, this.book.title, this.book.author).subscribe({
      next: (response) => {
        if (response.error) {
          this.showMessage(`Error: ${response.error}`, 'warning');
        } else {
          this.showMessage('Added to wishlist!', 'success');
        }
        this.wishlistLoading = false;
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        this.showMessage('Error adding to wishlist', 'error');
        this.wishlistLoading = false;
      }
    });
  }

  viewDetails() {
    const bookId = this.book?.book_id || this.book?.id;
    if (bookId) {
      this.router.navigate(['/book', bookId]);
    } else {
      console.error('Cannot navigate - missing book ID:', this.book);
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/book-placeholder.jpg';
    }
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
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  // Helper methods to safely get book properties
  getBookImage(): string {
    return this.book?.cover_image_url || 
           this.book?.image_url || 
           '/assets/book-placeholder.jpg';
  }

  getStockQuantity(): number {
    return parseInt(this.book?.stock_quantity) || 
           parseInt(this.book?.stock) || 
           0;
  }

  getPrice(): string {
    const price = parseFloat(this.book?.price) || 0;
    return price.toFixed(2);
  }

  // Fix the rating display to handle both API response formats
  getRating(): string {
    // Handle both rating and rating field names
    const rating = parseFloat(this.book?.rating) || 0;
    return rating > 0 ? rating.toFixed(1) : '4.5'; // Default to 4.5 if no rating
  }
}