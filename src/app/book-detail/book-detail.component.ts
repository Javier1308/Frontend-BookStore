// src/app/book-detail/book-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  description: string;
  image_url?: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Loading state -->
      <div *ngIf="loading" class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error state -->
      <div *ngIf="error && !loading" class="flex justify-center items-center h-screen">
        <div class="text-center">
          <div class="text-red-500 text-6xl mb-4">📚</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
          <p class="text-gray-600 mb-4">The book you're looking for doesn't exist or has been removed.</p>
          <button 
            (click)="goBack()"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Go Back
          </button>
        </div>
      </div>

      <!-- Book detail content -->
      <div *ngIf="book && !loading" class="max-w-7xl mx-auto px-4 py-8">
        <!-- Navigation -->
        <div class="mb-6">
          <button 
            (click)="goBack()"
            class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Books
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="md:flex">
            <!-- Book Image -->
            <div class="md:w-1/3 lg:w-1/4">
              <div class="aspect-w-3 aspect-h-4 bg-gray-200 relative">
                <img
                  [src]="getFullImageUrl(book.image_url) || '/assets/book-placeholder.jpg'"
                  [alt]="book.title"
                  class="w-full h-full object-cover"
                  (error)="onImageError($event)">
                
                <!-- Stock indicator -->
                <div class="absolute top-4 left-4">
                  <span
                    *ngIf="book.stock <= 5 && book.stock > 0"
                    class="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                    Only {{book.stock}} left
                  </span>
                  <span
                    *ngIf="book.stock === 0"
                    class="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                  <span
                    *ngIf="book.stock > 5"
                    class="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    In Stock
                  </span>
                </div>

                <!-- Favorite button -->
                <button
                  (click)="toggleFavorite()"
                  [disabled]="favoriteLoading"
                  class="absolute top-4 right-4 p-3 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                  <svg
                    class="w-6 h-6"
                    [class.text-red-500]="isFavorite"
                    [class.fill-current]="isFavorite"
                    [class.text-gray-400]="!isFavorite"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Book Details -->
            <div class="md:w-2/3 lg:w-3/4 p-8">
              <div class="mb-4">
                <span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {{book.category}}
                </span>
              </div>

              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{book.title}}</h1>
              <p class="text-xl text-gray-600 mb-4">by {{book.author}}</p>
              
              <div class="flex items-center mb-6">
                <span class="text-4xl font-bold text-blue-600 mr-4">\${{book.price}}</span>
                <div class="text-gray-500">
                  <p class="text-sm">Stock: {{book.stock}} available</p>
                </div>
              </div>

              <!-- Book Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">Book Information</h3>
                  <div class="space-y-2">
                    <div class="flex">
                      <span class="font-medium text-gray-600 w-20">ISBN:</span>
                      <span class="text-gray-800">{{book.isbn}}</span>
                    </div>
                    <div class="flex">
                      <span class="font-medium text-gray-600 w-20">Category:</span>
                      <span class="text-gray-800">{{book.category}}</span>
                    </div>
                    <div class="flex">
                      <span class="font-medium text-gray-600 w-20">Author:</span>
                      <span class="text-gray-800">{{book.author}}</span>
                    </div>
                    <div class="flex">
                      <span class="font-medium text-gray-600 w-20">Stock:</span>
                      <span class="text-gray-800">{{book.stock}} available</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">Purchase Options</h3>
                  <div class="space-y-3">
                    <button
                      (click)="addToCart()"
                      [disabled]="book.stock === 0 || addingToCart"
                      class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium">
                      {{addingToCart ? 'Adding...' : (book.stock === 0 ? 'Out of Stock' : 'Add to Cart')}}
                    </button>

                    <button
                      (click)="addToWishlist()"
                      [disabled]="wishlistLoading"
                      class="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                      {{wishlistLoading ? 'Adding...' : 'Add to Wishlist'}}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <div class="prose max-w-none">
                  <p class="text-gray-700 leading-relaxed">
                    {{book.description || 'No description available for this book.'}}
                  </p>
                </div>
              </div>

              <!-- Additional Information -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div *ngIf="book.created_at">
                    <span class="font-medium">Added:</span> {{formatDate(book.created_at)}}
                  </div>
                  <div *ngIf="book.updated_at">
                    <span class="font-medium">Last Updated:</span> {{formatDate(book.updated_at)}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading = true;
  error = false;
  isFavorite = false;
  addingToCart = false;
  favoriteLoading = false;
  wishlistLoading = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(bookId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadBook(bookId: string) {
    this.apiService.getBookById(bookId).subscribe({
      next: (response) => {
        console.log('Book API Response:', response); // Debug log
        // The response might be directly the book object or wrapped in an object
        const bookData = response.item || response;
        this.book = this.transformBook(bookData);
        this.loading = false;
        this.checkIfFavorite();
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private transformBook(apiBook: any): Book {
    return {
      id: apiBook.book_id,
      title: apiBook.title,
      author: apiBook.author,
      isbn: apiBook.isbn,
      category: apiBook.category,
      price: parseFloat(apiBook.price),
      description: apiBook.description,
      image_url: apiBook.cover_image_url,
      stock: parseInt(apiBook.stock_quantity || apiBook.stock || 0),
      created_at: apiBook.created_at,
      updated_at: apiBook.updated_at
    };
  }

  onImageError(event: any) {
    event.target.src = '/assets/book-placeholder.jpg';
  }

  getFullImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.startsWith('http')) {
      return imageUrl || '';
    }
    return imageUrl;
  }

  addToCart() {
    if (!this.book || this.book.stock === 0) return;

    this.addingToCart = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.user_id) {
      alert('Please login to add items to cart');
      this.addingToCart = false;
      return;
    }

    console.log('Adding book to cart:', {
      book_id: this.book.id,
      user_id: user.user_id,
      tenant_id: user.tenant_id || 'tenant1'
    });

    this.apiService.addToCart(this.book.id, 1).subscribe({
      next: (response: any) => {
        console.log('Added to cart:', response);
        this.showMessage('Added to cart successfully!', 'success');
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.error?.error,
          book_id: this.book?.id,
          user_id: user.user_id,
          tenant_id: user.tenant_id
        });
        
        // Try with different tenant if book not found
        if (error.status === 400 && error.error?.error?.includes('Book not found')) {
          this.tryAddWithDifferentTenant();
        } else {
          this.showMessage(error.error?.error || 'Failed to add to cart', 'error');
          this.addingToCart = false;
        }
      }
    });
  }

  private tryAddWithDifferentTenant() {
    if (!this.book) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const url = 'https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/cart';
    
    console.log('Trying to add to cart with tenant1...');
    
    this.http.post(url, {
      user_id: user.user_id,
      tenant_id: 'tenant1',
      book_id: this.book.id,
      quantity: 1
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response: any) => {
        console.log('Added to cart with tenant1:', response);
        this.showMessage('Added to cart successfully!', 'success');
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding with tenant1:', error);
        this.showMessage(error.error?.error || 'Failed to add to cart', 'error');
        this.addingToCart = false;
      }
    });
  }

  toggleFavorite() {
    if (!this.book) return;

    this.favoriteLoading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to manage favorites');
      this.favoriteLoading = false;
      return;
    }

    if (this.isFavorite) {
      // Remove from favorites
      this.apiService.removeFromFavorites(this.book.id).subscribe({
        next: (response: any) => {
          this.isFavorite = false;
          this.favoriteLoading = false;
          this.showMessage('Removed from favorites', 'success');
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          // If API doesn't support removal, just toggle locally
          this.isFavorite = false;
          this.favoriteLoading = false;
          this.showMessage('Removed from favorites', 'success');
        }
      });
    } else {
      // Add to favorites
      this.apiService.addToFavorites(this.book.id).subscribe({
        next: (response: any) => {
          this.isFavorite = true;
          this.favoriteLoading = false;
          this.showMessage('Added to favorites!', 'success');
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.showMessage('Failed to add to favorites', 'error');
          this.favoriteLoading = false;
        }
      });
    }
  }

  addToWishlist() {
    if (!this.book) return;

    this.wishlistLoading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to manage wishlist');
      this.wishlistLoading = false;
      return;
    }

    this.apiService.addToWishlist(this.book.id, this.book.title, this.book.author).subscribe({
      next: (response: any) => {
        this.wishlistLoading = false;
        this.showMessage('Added to wishlist!', 'success');
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        this.showMessage('Failed to add to wishlist', 'error');
        this.wishlistLoading = false;
      }
    });
  }

  private checkIfFavorite() {
    if (!this.book) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.apiService.getFavorites().subscribe({
      next: (response) => {
        const favorites = response.items || [];
        this.isFavorite = favorites.some((fav: any) => fav.book_id === this.book!.id);
      },
      error: (error) => {
        console.error('Error checking favorites:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/books']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } else {
      alert(message);
    }
  }
}
