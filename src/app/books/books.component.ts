// src/app/books/books.component.ts - REWRITTEN VERSION
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { BookCardComponent } from '../shared/book-card.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filter Section -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (keyup.enter)="searchBooks()"
              (focus)="showSuggestions = suggestions.length > 0"
              placeholder="Search books by title, author, category, or ISBN..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12">
            
            <!-- Search type indicator -->
            <div class="absolute right-12 top-1/2 transform -translate-y-1/2">
              <span *ngIf="isISBNSearch()" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ISBN</span>
              <span *ngIf="!isISBNSearch()" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">TEXT</span>
            </div>
            
            <!-- Search suggestions dropdown -->
            <div *ngIf="showSuggestions && suggestions.length > 0" 
                 class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
              <div *ngFor="let suggestion of suggestions" 
                   (click)="selectSuggestion(suggestion)"
                   class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div class="flex items-center space-x-3">
                  <img [src]="suggestion.cover_image_url || '/assets/book-placeholder.jpg'" 
                       [alt]="suggestion.title"
                       class="w-10 h-10 object-cover rounded">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ suggestion.title }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ suggestion.author }}</p>
                    <p class="text-xs text-gray-400">ISBN: {{ suggestion.isbn }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-blue-600">\${{ suggestion.price?.toFixed(2) }}</p>
                    <p class="text-xs text-gray-500">{{ suggestion.category }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button 
              (click)="searchBooks()"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
            <button 
              (click)="clearSearch()"
              class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Clear
            </button>
          </div>
        </div>
        
        <!-- Search info and filters -->
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">Search type:</span>
            <button 
              (click)="toggleSearchType()"
              class="px-3 py-1 text-xs rounded-full border transition-colors"
              [class.bg-blue-100]="searchType === 'isbn'"
              [class.text-blue-800]="searchType === 'isbn'"
              [class.border-blue-300]="searchType === 'isbn'"
              [class.bg-gray-100]="searchType === 'text'"
              [class.text-gray-600]="searchType === 'text'"
              [class.border-gray-300]="searchType === 'text'">
              {{ searchType === 'isbn' ? 'ISBN Search' : 'Text Search' }}
            </button>
          </div>
          
          <select 
            [(ngModel)]="selectedCategory"
            (change)="filterByCategory()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
          
          <select 
            [(ngModel)]="sortBy"
            (change)="sortBooks()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sort by</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="created_at">Date Added</option>
          </select>
          
          <!-- Search results info -->
          <div *ngIf="isSearching" class="text-sm text-gray-600">
            <span class="font-medium">{{ books.length }}</span> results for 
            <span class="font-medium">"{{ searchQuery }}"</span>
            <span *ngIf="searchType === 'isbn'" class="text-blue-600">(ISBN search)</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Books Grid -->
      <div *ngIf="!loading && books.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <app-book-card 
          *ngFor="let book of books; trackBy: trackByBookId" 
          [book]="book">
        </app-book-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && books.length === 0" class="text-center py-12">
        <div class="mx-auto w-16 h-16 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.1-5.597-2.709M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-lg">
          {{ isSearching ? 'No books found for your search' : 'No books found' }}
        </p>
        <p class="text-gray-400 mb-4">
          {{ isSearching ? 'Try different keywords or search by ISBN' : 'Try browsing our categories' }}
        </p>
        <button 
          (click)="clearSearch()"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          {{ isSearching ? 'Clear Search' : 'Load All Books' }}
        </button>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && pagination.total_pages > 1" class="mt-8 flex justify-center">
        <div class="flex space-x-2">
          <button 
            (click)="goToPage(pagination.current_page - 1)"
            [disabled]="!pagination.has_previous"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          
          <span class="px-4 py-2 text-gray-700">
            Page {{ pagination.current_page }} of {{ pagination.total_pages }}
          </span>
          
          <button 
            (click)="goToPage(pagination.current_page + 1)"
            [disabled]="!pagination.has_next"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Book Form Modal (same as before) -->
    <div *ngIf="showBookModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <!-- ... modal content remains the same ... -->
    </div>
  `
})
export class BooksComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Original books array to store all books when not searching
  private allBooks: Book[] = [];
  books: Book[] = [];
  categories: string[] = [];
  loading = false;
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'created_at';
  pagination: any = null;
  searchType: 'text' | 'isbn' = 'text';
  isSearching = false;
  
  // Search features
  fuzzySearchEnabled = false;
  prefixSearchEnabled = false;
  showSuggestions = false;
  suggestions: Book[] = [];
  private searchSubject = new Subject<string>();
  
  // Book form
  showBookModal = false;
  editingBook: Book | null = null;
  savingBook = false;
  bookFormData = {
    isbn: '',
    title: '',
    author: '',
    editorial: '',
    category: '',
    price: 0,
    stock_quantity: 0,
    description: '',
    cover_image_url: '',
    publication_year: new Date().getFullYear(),
    language: 'es',
    pages: 0,
    rating: 0
  };

  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['isbn']) {
        this.searchQuery = params['isbn'];
        this.searchType = 'isbn';
      }
      this.loadBooks();
    });
    
    // Setup search debounce for autocomplete
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.length >= 2) {
        this.loadAutocompleteSuggestions(query);
      } else {
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = ["Literatura", "Technology", "Ficción", "Testing", "Clásicos"];
      }
    });
  }

  // Transform Books API format to BookCard component format
  private transformBooks(apiBooks: any[]): any[] {
    return apiBooks.map(book => ({
      book_id: book.book_id,
      title: book.title || 'Unknown Title',
      author: book.author || 'Unknown Author',
      isbn: book.isbn || '',
      category: book.category || 'General',
      price: parseFloat(book.price) || 0,
      description: book.description || '',
      cover_image_url: book.cover_image_url || book.image_url || '',
      stock_quantity: parseInt(book.stock_quantity) || parseInt(book.stock) || 0,
      publication_year: book.publication_year || 0,
      language: book.language || 'en',
      pages: book.pages || 0,
      rating: parseFloat(book.rating) || 0,
      tenant_id: book.tenant_id || '',
      created_at: book.created_at || '',
      updated_at: book.updated_at || '',
      is_active: book.is_active !== false
    }));
  }

  loadBooks(page: number = 1) {
    this.loading = true;
    this.isSearching = false;
    
    this.apiService.getBooks(
      page,
      12,
      this.selectedCategory,
      this.sortBy
    ).subscribe({
      next: (response) => {
        this.allBooks = this.transformBooks(response.data || []);
        this.books = [...this.allBooks];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
        this.allBooks = [];
        this.loading = false;
      }
    });
  }

  onSearchInput() {
    // Auto-detect if user is typing an ISBN
    if (this.isISBNLike(this.searchQuery)) {
      this.searchType = 'isbn';
    } else if (this.searchQuery.length > 0) {
      this.searchType = 'text';
    }

    // Update autocomplete suggestions
    this.searchSubject.next(this.searchQuery);
    
    // Clear search if empty
    if (this.searchQuery.length === 0) {
      this.clearSearch();
    }
  }

  // Check if the query looks like an ISBN
  isISBNLike(query: string): boolean {
    // Remove hyphens and spaces
    const cleanQuery = query.replace(/[-\s]/g, '');
    // Check if it looks like an ISBN (10 or 13 digits, possibly with 'X')
    return /^(?:\d{9}[\dX]|\d{13})$/.test(cleanQuery) || 
           /^(?:\d{3}-?\d{1,5}-?\d{1,7}-?\d{1,7}-?[\dX]|\d{1,5}-?\d{1,7}-?\d{1,7}-?[\dX])$/.test(query);
  }

  // Check if current search is ISBN type
  isISBNSearch(): boolean {
    return this.searchType === 'isbn' || this.isISBNLike(this.searchQuery);
  }

  // Toggle between search types
  toggleSearchType() {
    this.searchType = this.searchType === 'text' ? 'isbn' : 'text';
    if (this.searchQuery.length > 0) {
      this.performSearch();
    }
  }

  // Called by (keyup.enter) and Search button
  searchBooks() {
    this.performSearch();
  }

  performSearch() {
    if (this.searchQuery.trim().length === 0) {
      this.clearSearch();
      return;
    }
    
    this.loading = true;
    this.isSearching = true;
    this.showSuggestions = false;
    
    // Clear pagination when searching
    this.pagination = null;
    
    // Determine search method based on search type or auto-detection
    if (this.searchType === 'isbn' || this.isISBNLike(this.searchQuery)) {
      this.searchByISBN();
    } else {
      this.searchByText();
    }
  }

  private searchByISBN() {
    // Clean the ISBN (remove hyphens and spaces)
    const cleanISBN = this.searchQuery.replace(/[-\s]/g, '');
    
    console.log('Searching by ISBN:', cleanISBN);
    
    this.apiService.searchByISBN(cleanISBN).subscribe({
      next: (book) => {
        // Single book result for ISBN search
        this.books = book ? [this.transformBook(book)] : [];
        this.pagination = {
          current_page: 1,
          total_pages: 1,
          total_items: this.books.length,
          items_per_page: 1,
          has_next: false,
          has_previous: false
        };
        this.loading = false;
        console.log('ISBN search results:', this.books.length);
      },
      error: (error) => {
        console.error('Error searching by ISBN:', error);
        this.books = [];
        this.loading = false;
      }
    });
  }

  private searchByText() {
    console.log('Searching by text:', this.searchQuery);
    
    this.apiService.searchBooks(this.searchQuery, this.fuzzySearchEnabled, 1, 12).subscribe({
      next: (response) => {
        this.books = this.transformBooks(response.data || []);
        this.pagination = response.pagination;
        this.loading = false;
        console.log('Text search results:', this.books.length);
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.books = [];
        this.loading = false;
      }
    });
  }

  private transformBook(apiBook: any): any {
    return {
      book_id: apiBook.book_id,
      title: apiBook.title || 'Unknown Title',
      author: apiBook.author || 'Unknown Author',
      isbn: apiBook.isbn || '',
      category: apiBook.category || 'General',
      price: parseFloat(apiBook.price) || 0,
      description: apiBook.description || '',
      cover_image_url: apiBook.cover_image_url || apiBook.image_url || '',
      stock_quantity: parseInt(apiBook.stock_quantity) || parseInt(apiBook.stock) || 0,
      publication_year: apiBook.publication_year || 0,
      language: apiBook.language || 'en',
      pages: apiBook.pages || 0,
      rating: parseFloat(apiBook.rating) || 0,
      tenant_id: apiBook.tenant_id || '',
      created_at: apiBook.created_at || '',
      updated_at: apiBook.updated_at || '',
      is_active: apiBook.is_active !== false
    };
  }

  loadAutocompleteSuggestions(query: string) {
    this.apiService.getAutocompleteSuggestions(query).subscribe({
      next: (response) => {
        this.suggestions = this.transformBooks(response.data || []);
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: (error) => {
        console.error('Error loading suggestions:', error);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  selectSuggestion(book: any) {
    this.searchQuery = book.isbn || book.title;
    this.searchType = book.isbn ? 'isbn' : 'text';
    this.showSuggestions = false;
    this.suggestions = [];
    this.performSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchType = 'text';
    this.isSearching = false;
    this.showSuggestions = false;
    this.suggestions = [];
    this.pagination = null;
    this.loadBooks();
  }

  onCategoryChange() {
    this.clearSearch();
    this.loadBooks();
  }

  filterByCategory() {
    this.clearSearch();
    this.selectedCategory = this.selectedCategory || '';
    this.loadBooks();
  }

  onSortChange() {
    if (this.isSearching) {
      this.performSearch();
    } else {
      this.loadBooks();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= (this.pagination?.total_pages || 1)) {
      this.pagination = { ...this.pagination, current_page: page };
      
      if (this.isSearching) {
        this.performSearch();
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
    
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // CRUD Operations
  openCreateModal() {
    this.editingBook = null;
    this.bookFormData = {
      isbn: '',
      title: '',
      author: '',
      editorial: '',
      category: '',
      price: 0,
      stock_quantity: 0,
      description: '',
      cover_image_url: '',
      publication_year: new Date().getFullYear(),
      language: 'es',
      pages: 0,
      rating: 0
    };
    this.showBookModal = true;
  }

  editBook(book: Book) {
    this.editingBook = book;
    this.bookFormData = {
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      editorial: book.editorial,
      category: book.category,
      price: book.price,
      stock_quantity: book.stock_quantity,
      description: book.description,
      cover_image_url: book.cover_image_url,
      publication_year: book.publication_year,
      language: book.language,
      pages: book.pages,
      rating: book.rating
    };
    this.showBookModal = true;
  }

  deleteBook(book: Book) {
    if (confirm(`¿Está seguro de eliminar el libro "${book.title}"?`)) {
      this.apiService.deleteBook(book.book_id).subscribe({
        next: () => {
          alert('Libro eliminado exitosamente');
          if (this.isSearching) {
            this.performSearch();
          } else {
            this.loadBooks();
          }
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Error al eliminar el libro');
        }
      });
    }
  }

  saveBook() {
    this.savingBook = true;
    
    if (this.editingBook) {
      this.apiService.updateBook(this.editingBook.book_id, this.bookFormData).subscribe({
        next: () => {
          alert('Libro actualizado exitosamente');
          this.closeBookModal();
          if (this.isSearching) {
            this.performSearch();
          } else {
            this.loadBooks();
          }
        },
        error: (error) => {
          console.error('Error updating book:', error);
          alert('Error al actualizar el libro');
          this.savingBook = false;
        }
      });
    } else {
      this.apiService.createBook(this.bookFormData).subscribe({
        next: () => {
          alert('Libro creado exitosamente');
          this.closeBookModal();
          this.clearSearch(); // Clear search to show all books including the new one
        },
        error: (error) => {
          console.error('Error creating book:', error);
          alert('Error al crear el libro');
          this.savingBook = false;
        }
      });
    }
  }

  closeBookModal() {
    this.showBookModal = false;
    this.editingBook = null;
    this.savingBook = false;
  }

  // Click outside handler for autocomplete
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSuggestions = false;
    }
  }

  trackByBookId(index: number, book: Book): string {
    return book.book_id;
  }

  sortBooks() {
    this.onSortChange();
  }
}