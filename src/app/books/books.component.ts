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
          <div class="flex-1">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (keyup.enter)="searchBooks()"
              placeholder="Search books by title, author, or category..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <button 
            (click)="searchBooks()"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>
        
        <div class="flex flex-wrap gap-4">
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
        <p class="text-gray-500 text-lg">No books found</p>
        <button 
          (click)="loadBooks()"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Load All Books
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

  // Called by (keyup.enter) and Search button
  searchBooks() {
    this.performSearch();
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
    
    this.apiService.searchBooks(this.searchQuery, this.fuzzySearchEnabled, 1, 12).subscribe({
      next: (response) => {
        this.books = this.transformBooks(response.data || []);
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