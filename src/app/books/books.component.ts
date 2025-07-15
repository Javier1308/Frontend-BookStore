// src/app/books/books.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

interface BooksResponse {
  data: Book[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

interface SearchResponse {
  data: Book[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Book Collection</h1>
        
        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Search books by title, author..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                [(ngModel)]="selectedCategory"
                (change)="onCategoryChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">{{category}}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select 
                [(ngModel)]="sortBy"
                (change)="onSortChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="created_at">Newest</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Grid -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && books.length === 0" class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"></path>
        </svg>
        <p class="text-gray-500 text-lg">No books found</p>
        <button 
          (click)="loadBooks()"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Reload Books
        </button>
      </div>

      <div *ngIf="!loading && books.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <app-book-card 
          *ngFor="let book of books" 
          [book]="transformBook(book)">
        </app-book-card>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && pagination && pagination.total_pages > 1" class="mt-8 flex justify-center">
        <nav class="flex space-x-2">
          <button 
            (click)="goToPage(pagination.current_page - 1)"
            [disabled]="!pagination.has_previous"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          
          <button 
            *ngFor="let page of getPageNumbers()"
            (click)="goToPage(page)"
            [class.bg-blue-600]="page === pagination.current_page"
            [class.text-white]="page === pagination.current_page"
            [class.bg-gray-200]="page !== pagination.current_page"
            [class.text-gray-700]="page !== pagination.current_page"
            class="px-3 py-2 rounded-lg hover:bg-blue-500 hover:text-white">
            {{page}}
          </button>
          
          <button 
            (click)="goToPage(pagination.current_page + 1)"
            [disabled]="!pagination.has_next"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </nav>
      </div>

      <!-- Results Info -->
      <div *ngIf="!loading && pagination" class="mt-4 text-center text-sm text-gray-600">
        Showing {{books.length}} of {{pagination.total_items}} books
        <span *ngIf="searchQuery"> for "{{searchQuery}}"</span>
        <span *ngIf="selectedCategory"> in {{selectedCategory}}</span>
      </div>
    </div>
  `
})
export class BooksComponent implements OnInit {
  private http = inject(HttpClient);
  
  books: Book[] = [];
  categories: string[] = [];
  loading = false;
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'created_at';
  pagination: any = null;

  ngOnInit() {
    this.loadCategories();
    this.loadBooks();
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

  loadBooks() {
    this.loading = true;
    const token = localStorage.getItem('token');
    
    let url = `https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev/api/v1/books?tenant_id=tenant1&page=${this.pagination?.current_page || 1}&limit=12`;
    
    // Add category filter if selected
    if (this.selectedCategory) {
      url += `&category=${encodeURIComponent(this.selectedCategory)}`;
    }
    
    // Add sort parameter if specified
    if (this.sortBy) {
      url += `&sort=${this.sortBy}`;
    }
    
    this.http.get<BooksResponse>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.books = response.data || [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.searchBooks();
    } else {
      this.resetSearch();
    }
  }

  searchBooks() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const url = `https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev/api/v1/books/search?tenant_id=tenant1&q=${encodeURIComponent(this.searchQuery)}`;
    
    this.http.get<SearchResponse>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.books = response.data || [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.books = [];
        this.loading = false;
      }
    });
  }

  resetSearch() {
    this.searchQuery = '';
    this.pagination = null;
    this.loadBooks();
  }

  onCategoryChange() {
    this.pagination = null;
    this.loadBooks();
  }

  onSortChange() {
    this.pagination = null;
    this.loadBooks();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= (this.pagination?.total_pages || 1)) {
      this.pagination = { ...this.pagination, current_page: page };
      
      if (this.searchQuery.trim()) {
        this.searchBooks();
      } else {
        this.loadBooks();
      }
    }
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];
    
    const pages: number[] = [];
    const totalPages = this.pagination.total_pages;
    const currentPage = this.pagination.current_page;
    
    // Show max 7 pages around current page
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
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