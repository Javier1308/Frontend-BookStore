import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Favorites</h1>
        <button 
          (click)="clearAllFavorites()"
          [disabled]="loading || favorites.length === 0"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Clear All
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && favorites.length === 0" class="text-center py-12">
        <div class="mx-auto w-16 h-16 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-lg mb-4">No favorites yet</p>
        <button 
          routerLink="/books"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Browse Books
        </button>
      </div>

      <div *ngIf="!loading && favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let favorite of favorites" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          
          <div class="relative">
            <img 
              [src]="favorite.image_url || favorite.cover_image_url || '/assets/book-placeholder.jpg'" 
              [alt]="favorite.title"
              class="w-full h-48 object-cover"
              (error)="onImageError($event)">
            
            <button 
              (click)="removeFromFavorites(favorite)"
              [disabled]="removing"
              class="absolute top-2 right-2 bg-white rounded-full p-2 text-red-600 hover:text-red-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ favorite.title !== 'Unknown' ? favorite.title : 'Book Title Not Available' }}
            </h3>
            <p class="text-gray-600 mb-2">
              by {{ favorite.author !== 'Unknown' ? favorite.author : 'Author Not Available' }}
            </p>
            <p class="text-sm text-gray-500 mb-2">
              Added: {{ formatDate(favorite.added_at) }}
            </p>
            <div *ngIf="favorite.price > 0" class="text-lg font-bold text-blue-600 mb-4">
              \${{ favorite.price.toFixed(2) }}
            </div>
            
            <div class="flex space-x-2">
              <button 
                (click)="viewBook(favorite.book_id)"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
              <button 
                (click)="addToCart(favorite.book_id)"
                [disabled]="addingToCart"
                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  favorites: any[] = [];
  loading = false;
  removing = false;
  addingToCart = false;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.apiService.getFavorites(1, 100).subscribe({
      next: (response) => {
        this.favorites = response.items || [];
        this.enrichFavoritesWithBookData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.loading = false;
      }
    });
  }

  private enrichFavoritesWithBookData() {
    if (!this.favorites || this.favorites.length === 0) {
      return;
    }

    // Create observables for book details that need to be enriched
    const bookDetailRequests = this.favorites
      .filter(favorite => favorite.title === 'Unknown' || !favorite.cover_image_url)
      .map(favorite => 
        this.apiService.getBookById(favorite.book_id).pipe(
          tap(book => {
            // Update the favorite with complete book information
            favorite.title = book.title;
            favorite.author = book.author;
            favorite.price = book.price;
            favorite.description = book.description;
            favorite.cover_image_url = book.cover_image_url;
            favorite.image_url = book.cover_image_url;
            favorite.isbn = book.isbn;
            favorite.category = book.category;
            favorite.stock = book.stock_quantity;
          }),
          catchError(error => {
            console.error(`Error fetching book details for ${favorite.book_id}:`, error);
            // Keep the favorite but mark it as unavailable
            favorite.title = 'Book Not Available';
            favorite.author = 'Author Not Available';
            favorite.image_url = '/assets/book-placeholder.jpg';
            favorite.cover_image_url = '/assets/book-placeholder.jpg';
            favorite.price = 0;
            return of(null);
          })
        )
      );

    // If there are requests to make, execute them all
    if (bookDetailRequests.length > 0) {
      forkJoin(bookDetailRequests).subscribe({
        next: () => {
          // Force change detection after all data is loaded
          this.favorites = [...this.favorites];
        },
        error: (error) => {
          console.error('Error enriching favorites:', error);
        }
      });
    }
  }

  removeFromFavorites(favorite: any) {
    if (confirm(`Remove "${favorite.title}" from favorites?`)) {
      this.removing = true;
      this.apiService.removeFromFavorites(favorite.book_id).subscribe({
        next: (response) => {
          this.showMessage('Removed from favorites successfully!', 'success');
          this.loadFavorites(); // Reload the list
          this.removing = false;
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.showMessage('Failed to remove from favorites', 'error');
          this.removing = false;
        }
      });
    }
  }

  clearAllFavorites() {
    if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      this.removing = true;
      
      this.apiService.clearAllFavorites().subscribe({
        next: (response: any) => {
          const messageType = response.errors > 0 ? 'warning' : 'success';
          this.showMessage(response.message, messageType);
          this.loadFavorites(); // Reload the list
          this.removing = false;
        },
        error: (error) => {
          console.error('Error clearing favorites:', error);
          this.showMessage('Failed to clear all favorites', 'error');
          this.removing = false;
        }
      });
    }
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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
