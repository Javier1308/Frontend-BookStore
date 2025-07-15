// src/app/shared/book-card.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div class="aspect-w-3 aspect-h-4 bg-gray-200 relative">
        <img 
          [src]="book.image_url || '/assets/book-placeholder.jpg'" 
          [alt]="book.title"
          class="w-full h-48 object-cover"
          (error)="onImageError($event)">
        
        <!-- Favorite Button -->
        <button 
          (click)="toggleFavorite()"
          [disabled]="favoriteLoading"
          class="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
          <svg 
            class="w-5 h-5"
            [class.text-red-500]="isFavorite"
            [class.fill-current]="isFavorite"
            [class.text-gray-400]="!isFavorite"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>

        <!-- Stock Badge -->
        <div class="absolute top-2 left-2">
          <span 
            *ngIf="book.stock <= 5 && book.stock > 0"
            class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Only {{book.stock}} left
          </span>
          <span 
            *ngIf="book.stock === 0"
            class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </span>
        </div>
      </div>
      
      <div class="p-6">
        <div class="mb-2">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {{book.category}}
          </span>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {{book.title}}
        </h3>
        
        <p class="text-gray-600 mb-2 text-sm">by {{book.author}}</p>
        
        <p class="text-xs text-gray-500 mb-3">ISBN: {{book.isbn}}</p>
        
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-blue-600">\${{book.price}}</span>
          <div class="text-right">
            <p class="text-xs text-gray-500">Stock: {{book.stock}}</p>
          </div>
        </div>

        <div class="space-y-2">
          <button 
            (click)="addToCart()"
            [disabled]="book.stock === 0 || addingToCart"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{addingToCart ? 'Adding...' : (book.stock === 0 ? 'Out of Stock' : 'Add to Cart')}}
          </button>

          <div class="grid grid-cols-2 gap-2">
            <button 
              (click)="addToWishlist()"
              [disabled]="wishlistLoading"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              {{wishlistLoading ? '...' : 'Wishlist'}}
            </button>
            
            <button 
              (click)="viewDetails()"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookCardComponent {
  @Input() book!: Book;
  
  private http = inject(HttpClient);
  
  isFavorite = false;
  addingToCart = false;
  favoriteLoading = false;
  wishlistLoading = false;

  ngOnInit() {
    // Check if this book is in user's favorites
    this.checkIfFavorite();
  }

  onImageError(event: any) {
    event.target.src = '/assets/book-placeholder.jpg';
  }

  addToCart() {
    if (this.book.stock === 0) return;
    
    this.addingToCart = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.user_id) {
      alert('Please login to add items to cart');
      this.addingToCart = false;
      return;
    }

    const url = 'https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/cart';
    
    this.http.post(url, {
      user_id: user.user_id,
      tenant_id: user.tenant_id || 'tenant1',
      book_id: this.book.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        console.log('Added to cart:', response);
        // Show success message
        this.showMessage('Added to cart successfully!', 'success');
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showMessage(error.error?.error || 'Failed to add to cart', 'error');
        this.addingToCart = false;
      }
    });
  }

  toggleFavorite() {
    this.favoriteLoading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login to manage favorites');
      this.favoriteLoading = false;
      return;
    }

    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/favorites?tenant_id=tenant1`;
    
    if (this.isFavorite) {
      // Remove from favorites (API doesn't have delete endpoint, so we'll just toggle state)
      this.isFavorite = false;
      this.favoriteLoading = false;
      this.showMessage('Removed from favorites', 'success');
    } else {
      // Add to favorites
      this.http.post(url, {
        book_id: this.book.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
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
    this.wishlistLoading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login to manage wishlist');
      this.wishlistLoading = false;
      return;
    }

    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/wishlist?tenant_id=tenant1`;
    
    this.http.post(url, {
      book_id: this.book.id,
      title: this.book.title,
      author: this.book.author
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
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

  viewDetails() {
    // Show book details in a modal or navigate to details page
    alert(`Book Details:\n\nTitle: ${this.book.title}\nAuthor: ${this.book.author}\nISBN: ${this.book.isbn}\nCategory: ${this.book.category}\nPrice: $${this.book.price}\nStock: ${this.book.stock}\n\nDescription: ${this.book.description || 'No description available.'}`);
  }

  private checkIfFavorite() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/favorites?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        const favorites = response.items || [];
        this.isFavorite = favorites.some((fav: any) => fav.book_id === this.book.id);
      },
      error: (error) => {
        console.error('Error checking favorites:', error);
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error') {
    // Simple alert for now - in a real app, you'd use a toast notification service
    if (type === 'success') {
      // Create a temporary success notification
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