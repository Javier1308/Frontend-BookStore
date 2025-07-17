import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { BookCardComponent } from '../shared/book-card.component';

// Interface for book data
interface Book {
  book_id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  price: number;
  description?: string;
  cover_image_url?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
  rating?: number;
}

// Interface for API health status
interface ApiHealth {
  users: boolean;
  books: boolean;
  purchases: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BookCardComponent],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <!-- Hero Section -->
      <div class="bg-blue-600 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">Welcome to BookStore</h1>
          <p class="text-xl md:text-2xl mb-8">Discover your next favorite book</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              (click)="goToBooks()"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Books
            </button>
            <button 
              *ngIf="isAuthenticated"
              (click)="goToWishlist()"
              class="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors border border-white">
              My Wishlist
            </button>
          </div>
        </div>
      </div>

      <!-- Featured Books Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Featured Books</h2>
        
        <div *ngIf="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div *ngIf="!loading && featuredBooks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-book-card 
            *ngFor="let book of featuredBooks; trackBy: trackByBookId" 
            [book]="book">
          </app-book-card>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          
          <div *ngIf="!loadingCategories && categories.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button 
              *ngFor="let category of categories"
              (click)="browseCategory(category)"
              class="bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center">
              {{ category }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  featuredBooks: Book[] = [];
  categories: string[] = [];
  loading = false;
  loadingCategories = false;

  get isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  ngOnInit() {
    this.loadFeaturedBooks();
    this.loadCategories();
  }

  loadFeaturedBooks() {
    this.loading = true;
    this.apiService.getBooks(1, 8).subscribe({
      next: (response) => {
        console.log('Home page API response:', response); // Debug log
        this.featuredBooks = this.transformBooks(response.data || []);
        console.log('Transformed featured books:', this.featuredBooks); // Debug log
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured books:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.loadingCategories = true;
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories || [];
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = ['Literatura', 'Technology', 'Ficción', 'Testing', 'Clásicos'];
        this.loadingCategories = false;
      }
    });
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }

  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  browseCategory(category: string) {
    this.router.navigate(['/books'], { queryParams: { category } });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/book-placeholder.jpg';
    }
  }

  trackByBookId(index: number, book: Book): string {
    return book.book_id;
  }

  private transformBooks(apiBooks: any[]): Book[] {
    return apiBooks.map(book => {
      const transformed = this.transformBook(book);
      console.log('Transforming book:', book, 'to:', transformed); // Debug log
      return transformed;
    });
  }

  private transformBook(apiBook: any): Book {
    // Ensure book_id is properly set - this is the key fix
    const bookId = apiBook.book_id || apiBook.id;
    
    if (!bookId) {
      console.error('Book missing ID:', apiBook);
    }
    
    const transformed = {
      book_id: bookId, // Make sure this is properly set
      title: apiBook.title || 'Unknown Title',
      author: apiBook.author || 'Unknown Author',
      isbn: apiBook.isbn || '',
      category: apiBook.category || 'General',
      price: parseFloat(apiBook.price) || 0,
      description: apiBook.description || '',
      cover_image_url: apiBook.cover_image_url || apiBook.image_url || '',
      stock_quantity: parseInt(apiBook.stock_quantity) || parseInt(apiBook.stock) || 0,
      rating: parseFloat(apiBook.rating) || 0,
      created_at: apiBook.created_at || '',
      updated_at: apiBook.updated_at || ''
    };
    
    console.log('Home page transforming book:', apiBook, 'to:', transformed);
    console.log('Book ID check:', { original: apiBook.book_id, transformed: transformed.book_id });
    
    return transformed;
  }

  // Add method to refresh featured books after favorites changes
  refreshFeaturedBooks() {
    this.loadFeaturedBooks();
  }
}