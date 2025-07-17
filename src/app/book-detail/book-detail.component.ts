// src/app/book-detail/book-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && book" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="md:flex">
          <div class="md:flex-shrink-0">
            <img 
              [src]="book.cover_image_url || '/assets/book-placeholder.jpg'" 
              [alt]="book.title"
              class="h-48 w-full object-cover md:h-full md:w-48"
              (error)="onImageError($event)">
          </div>
          <div class="p-8">
            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{{ book.category }}</div>
            <h1 class="mt-1 text-2xl font-bold text-gray-900">{{ book.title }}</h1>
            <p class="mt-2 text-gray-600">by {{ book.author }}</p>
            <p class="mt-2 text-gray-600">{{ book.editorial }}</p>
            <div class="mt-4">
              <span class="text-3xl font-bold text-blue-600">\${{ book.price.toFixed(2) }}</span>
            </div>
            <div class="mt-4">
              <p class="text-gray-700">{{ book.description }}</p>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">ISBN:</span> {{ book.isbn }}
              </div>
              <div>
                <span class="font-medium">Pages:</span> {{ book.pages }}
              </div>
              <div>
                <span class="font-medium">Language:</span> {{ book.language }}
              </div>
              <div>
                <span class="font-medium">Published:</span> {{ book.publication_year }}
              </div>
              <div>
                <span class="font-medium">Stock:</span> {{ book.stock_quantity }}
              </div>
              <div>
                <span class="font-medium">Rating:</span> {{ book.rating }}/5
              </div>
            </div>
            <div class="mt-6 flex space-x-3">
              <button 
                (click)="addToCart()"
                [disabled]="!apiService.isAuthenticated() || book.stock_quantity <= 0"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ book.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
              </button>
              
              <button 
                (click)="toggleFavorite()"
                [disabled]="!apiService.isAuthenticated() || favoritesLoading"
                class="bg-white border-2 py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                [class.border-red-500]="isFavorite"
                [class.text-red-500]="isFavorite"
                [class.bg-red-50]="isFavorite"
                [class.border-gray-300]="!isFavorite"
                [class.text-gray-600]="!isFavorite"
                [class.hover:border-red-500]="!isFavorite"
                [class.hover:text-red-500]="!isFavorite"
                [class.hover:bg-red-50]="!isFavorite">
                
                <svg *ngIf="!favoritesLoading && isFavorite" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
                
                <svg *ngIf="!favoritesLoading && !isFavorite" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                
                <div *ngIf="favoritesLoading" class="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              </button>
              
              <button 
                (click)="addToWishlist()"
                [disabled]="!apiService.isAuthenticated() || wishlistLoading"
                class="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                <svg *ngIf="!wishlistLoading" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                </svg>
                <div *ngIf="wishlistLoading" class="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !book" class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
        <button 
          (click)="goBack()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  `
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public apiService = inject(ApiService);
  
  book: any = null;
  loading = false;
  isFavorite = false;
  favoritesLoading = false;
  wishlistLoading = false;

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(bookId);
    }
  }

  loadBook(bookId: string) {
    this.loading = true;
    this.apiService.getBookById(bookId).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
        this.checkIfFavorite();
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.loading = false;
      }
    });
  }

  addToCart() {
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.apiService.addToCart(this.book.book_id, 1).subscribe({
      next: (response) => {
        this.showMessage('Added to cart successfully!', 'success');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showMessage('Error adding to cart: ' + (error.message || 'Unknown error'), 'error');
      }
    });
  }

  toggleFavorite() {
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.favoritesLoading = true;

    if (this.isFavorite) {
      // Remove from favorites
      this.apiService.removeFromFavorites(this.book.book_id).subscribe({
        next: (response) => {
          this.isFavorite = false;
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
      this.apiService.addToFavorites(this.book.book_id).subscribe({
        next: (response) => {
          this.isFavorite = true;
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
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.wishlistLoading = true;
    this.apiService.addToWishlist(this.book.book_id, this.book.title, this.book.author).subscribe({
      next: (response) => {
        if (response.error) {
          this.showMessage('Wishlist: ' + response.error, 'warning');
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

  private checkIfFavorite() {
    if (!this.apiService.isAuthenticated()) {
      return;
    }

    this.apiService.getFavorites(1, 100).subscribe({
      next: (response) => {
        const favorites = response.items || [];
        this.isFavorite = favorites.some((fav: any) => fav.book_id === this.book.book_id);
      },
      error: (error) => {
        console.error('Error checking favorites:', error);
      }
    });
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

  goBack() {
    this.router.navigate(['/books']);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/book-placeholder.jpg';
    }
  }
}