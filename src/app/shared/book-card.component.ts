// src/app/shared/book-card.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../services/api.service'; // Import API_CONFIG

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
          [src]="getFullImageUrl(book.image_url) || '/assets/book-placeholder.jpg'"
          [alt]="book.title"
          class="w-full h-48 object-cover"
          (error)="onImageError($event)">

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

  // Method to construct the full image URL
  getFullImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.startsWith('http')) {
      return imageUrl || '';
    }
    // Assuming image_url from the book object is just the S3 key relative to the tenant
    // We need to construct the full URL using the IMAGES_API_URL or the base S3 bucket URL directly if known.
    // Based on the Images API documentation, the public URL is directly from S3.
    // For now, we'll prefix with the known S3 bucket URL from the documentation for book covers.
    const S3_BASE_URL = 'https://bookstore-images-dev-328458381283.s3.amazonaws.com/';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenant_id || API_CONFIG.DEFAULT_TENANT;

    // The image_url returned by the books API is expected to be a full URL, or a key.
    // If it's a key like 'tenant/books/book_123/cover_timestamp.jpeg', then we reconstruct.
    // If the image_url is just a filename, you'd need the book_id and tenant to construct.
    // Based on the provided API documentation and data, the ideal scenario is that
    // the 'cover_image_url' from the books API is already the complete S3 public URL.
    // If it's not, and it's just a path segment, then this logic below tries to build it.
    // However, if the backend sends empty, this won't help.

    // Given the API response structure, it is more likely `cover_image_url` is intended to be the full URL.
    // If it's relative, it would look something like 'tenant/books/book_id/filename.jpg'.
    // The images API doc shows full URLs in its successful responses.
    // So, if the imageUrl is not starting with 'http', it means it's malformed or not a direct URL.
    // The simplest fix for the given problem (image_a7fc82.jpg showing '<empty>')
    // is ensuring the backend provides a valid, full URL in `cover_image_url`.
    // The code below is a *safeguard* if the backend provides a relative path,
    // but the primary issue is missing/invalid URLs from the API itself.

    // A more robust approach might be to check if imageUrl is just a filename
    // and then use the IMAGES_API_URL and book_id to request a presigned URL or
    // construct the full public URL from the S3 key if the API returns just the key.

    // For now, let's assume `image_url` *might* contain just the key or a path relative to the bucket.
    // The `DOCUMENTACION_IMAGES_API.md` shows the S3 key includes the tenant ID, e.g., 'tenant/books/book_123/cover_...'
    // So, if the `image_url` is already a full S3 path, we use it directly.
    // If it's a relative path like 'books/book_id/filename.jpg', we need to prepend the base.
    // If it's just a filename, then the backend should return the full path or provide enough info.

    // Given the `DOCUMENTACION_IMAGES_API.md` for 'UPLOAD BOOK COVER IMAGE' response,
    // `image_url` is a *full S3 URL*.
    // So, the `transformBook` in `dashboard.component.ts` should ideally just pass that full URL.
    // The problem from image_a7fc82.jpg is that `cover_image_url` is `<empty>`.
    // This `getFullImageUrl` function is only useful if the backend sends relative paths.
    // But since the API returns full URLs, the main fix is to ensure the backend actually provides them.
    // However, adding this check for non-http URLs is a good defensive measure.

    // If imageUrl is already a full URL, return it directly.
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's just a path fragment, try to construct a full S3 URL based on known structure.
    // Example: 'book_123/cover_20250713_142037.jpeg' (if backend only gives filename/partial path)
    // This assumes the `imageUrl` property in `Book` interface is just the filename/partial key.
    // If `book.image_url` is the S3 key like `tenant1/books/book_id/filename.jpg`, then
    // `return S3_BASE_URL + imageUrl;` might be sufficient.
    // If the `image_url` from the `Book` interface is intended to be *just* the filename,
    // then the construction needs to include `tenantId` and `book.id`.
    // Based on the provided image, the `cover_image_url` in the database is directly problematic.

    // For now, let's just use the imageUrl directly and rely on the fallback if it's invalid.
    // The core issue is that `apiBook.cover_image_url` is often empty in the database.
    return imageUrl; // Keep it as is, and let onImageError handle if it's invalid/empty
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