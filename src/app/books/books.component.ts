// src/app/books/books.component.ts - FIXED VERSION
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-800">Book Collection</h1>
          <button 
            (click)="openCreateModal()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Crear Producto
          </button>
        </div>
        
        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <!-- Search Box with Autocomplete -->
          <div class="mb-4 relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Búsqueda de Productos</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (keyup.enter)="performSearch()"
              placeholder="Buscar por título, autor o descripción..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            
            <!-- Clear Search Button -->
            <button 
              *ngIf="searchQuery.length > 0"
              (click)="clearSearch()"
              class="absolute right-3 top-12 text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <!-- Autocomplete Dropdown -->
            <div 
              *ngIf="showSuggestions && suggestions.length > 0" 
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div 
                *ngFor="let suggestion of suggestions"
                (click)="selectSuggestion(suggestion)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div class="font-semibold">{{ suggestion.title }}</div>
                <div class="text-sm text-gray-600">{{ suggestion.author }} - {{ suggestion.category }}</div>
              </div>
            </div>
          </div>

          <!-- Search Options -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="fuzzySearch"
                [(ngModel)]="fuzzySearchEnabled"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label for="fuzzySearch" class="text-sm text-gray-700">
                Búsqueda Fuzzy (encuentra palabras similares)
              </label>
            </div>
            
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="prefixSearch"
                [(ngModel)]="prefixSearchEnabled"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label for="prefixSearch" class="text-sm text-gray-700">
                Búsqueda por Prefijo
              </label>
            </div>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <!-- Search Status -->
          <div *ngIf="isSearching" class="mt-4 text-blue-600">
            Buscando: "{{ searchQuery }}"
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
        <p class="text-gray-500 text-lg">
          {{ isSearching ? 'No se encontraron libros con "' + searchQuery + '"' : 'No books found' }}
        </p>
        <button 
          (click)="isSearching ? clearSearch() : loadBooks()"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          {{ isSearching ? 'Clear Search' : 'Reload Books' }}
        </button>
      </div>

      <div *ngIf="!loading && books.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let book of books" class="relative">
          <app-book-card [book]="transformBook(book)"></app-book-card>
          
          <!-- Admin Actions -->
          <div class="absolute top-2 right-2 flex gap-1">
            <button 
              (click)="editBook(book)"
              class="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              (click)="deleteBook(book)"
              class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
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
        <span *ngIf="isSearching"> for "{{searchQuery}}"</span>
        <span *ngIf="selectedCategory"> in {{selectedCategory}}</span>
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
  
  // Original books array to store all books when not searching
  private allBooks: Book[] = [];
  books: Book[] = [];
  categories: string[] = [];
  loading = false;
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'created_at';
  pagination: any = null;
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
    this.loadBooks();
    
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

  loadBooks() {
    this.loading = true;
    this.isSearching = false;
    
    this.apiService.getBooks(
      this.pagination?.current_page || 1,
      12,
      this.selectedCategory,
      this.sortBy
    ).subscribe({
      next: (response) => {
        this.allBooks = response.data || [];
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
    // Update autocomplete suggestions
    this.searchSubject.next(this.searchQuery);
    
    // Perform search after a delay
    if (this.searchQuery.length >= 2) {
      // Don't perform full search on every keystroke, wait for user to stop typing
      // This is handled by a separate debounce or on Enter key
    } else if (this.searchQuery.length === 0) {
      this.clearSearch();
    }
  }

  performSearch() {
    if (this.searchQuery.trim().length < 2) {
      return;
    }
    
    this.loading = true;
    this.isSearching = true;
    this.showSuggestions = false;
    
    // Clear pagination when searching
    this.pagination = null;
    
    if (this.prefixSearchEnabled) {
      this.apiService.searchByPrefix(this.searchQuery).subscribe({
        next: (response) => {
          this.books = response.data || [];
          this.pagination = response.pagination;
          this.loading = false;
          console.log('Prefix search results:', this.books.length);
        },
        error: (error) => {
          console.error('Error searching books:', error);
          this.books = [];
          this.loading = false;
        }
      });
    } else {
      this.apiService.searchBooks(this.searchQuery, this.fuzzySearchEnabled).subscribe({
        next: (response) => {
          this.books = response.data || [];
          this.pagination = response.pagination;
          this.loading = false;
          console.log('Search results:', this.books.length);
        },
        error: (error) => {
          console.error('Error searching books:', error);
          this.books = [];
          this.loading = false;
        }
      });
    }
  }

  loadAutocompleteSuggestions(query: string) {
    this.apiService.getAutocompleteSuggestions(query).subscribe({
      next: (response) => {
        this.suggestions = response.data || [];
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: (error) => {
        console.error('Error loading suggestions:', error);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  selectSuggestion(book: Book) {
    this.searchQuery = book.title;
    this.showSuggestions = false;
    this.suggestions = [];
    this.performSearch();
  }

  clearSearch() {
    this.searchQuery = '';
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

  // Click outside handler for autocomplete
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSuggestions = false;
    }
  }
}