// services/api.service.ts - FINAL VERSION
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

// User Models
interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: string;
  is_active?: boolean;
  email_verified?: boolean;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Book Models
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

interface BookSearchResponse {
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

// Cart Models
interface CartItem {
  cart_item_id: string;
  book_id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  subtotal: number;
  added_at: string;
  isbn: string;
  image_url: string;
}

interface Cart {
  cart_items: CartItem[];
  summary: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  item_count: number;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // API Base URLs from documentation
  private readonly USERS_API = 'https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev';
  private readonly BOOKS_API = 'https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev';
  private readonly PURCHASES_API = 'https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev';
  
  // Tenant ID from documentation - Books API uses tenant1, Purchases uses default
  private readonly TENANT_ID = 'tenant1';
  private readonly PURCHASES_TENANT_ID = 'default';
  
  // Auth state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // ========================
  // AUTH METHODS (Users API)
  // ========================
  
  private loadUserFromStorage(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.USERS_API}/api/v1/login?tenant_id=${this.TENANT_ID}`,
      { email, password }
    ).pipe(
      tap(response => {
        this.setCurrentUser(response.user, response.token);
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.USERS_API}/api/v1/register?tenant_id=${this.TENANT_ID}`,
      userData
    ).pipe(
      tap(response => {
        this.setCurrentUser(response.user, response.token);
      }),
      catchError(error => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  validateToken(): Observable<{ valid: boolean; user: User }> {
    return this.http.get<{ valid: boolean; user: User }>(
      `${this.USERS_API}/api/v1/validate-token?tenant_id=${this.TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  private setCurrentUser(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // ========================
  // BOOKS API METHODS
  // ========================

  getBooks(page: number = 1, limit: number = 20, category?: string, sort?: string): Observable<BookSearchResponse> {
    let params = new HttpParams()
      .set('tenant_id', this.TENANT_ID)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) params = params.set('category', category);
    if (sort) params = params.set('sort', sort);

    return this.http.get<BookSearchResponse>(
      `${this.BOOKS_API}/api/v1/books`,
      { params, headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching books:', error);
        return of({ data: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 20, has_next: false, has_previous: false } });
      })
    );
  }

  getBookById(bookId: string): Observable<Book> {
    return this.http.get<Book>(
      `${this.BOOKS_API}/api/v1/books/${bookId}?tenant_id=${this.TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  searchBooks(query: string, fuzzyEnabled: boolean = false, page: number = 1, limit: number = 20): Observable<BookSearchResponse> {
    let params = new HttpParams()
      .set('tenant_id', this.TENANT_ID)
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<BookSearchResponse>(
      `${this.BOOKS_API}/api/v1/books/search`,
      { params, headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error searching books:', error);
        return of({ data: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 20, has_next: false, has_previous: false } });
      })
    );
  }

  getAutocompleteSuggestions(query: string): Observable<BookSearchResponse> {
    return this.searchBooks(query, false, 1, 5);
  }

  searchByPrefix(query: string): Observable<BookSearchResponse> {
    return this.searchBooks(query, false);
  }

  getCategories(): Observable<{ categories: string[] }> {
    return this.http.get<{ categories: string[] }>(
      `${this.BOOKS_API}/api/v1/books/categories?tenant_id=${this.TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of({ categories: ['Literatura', 'Technology', 'Ficción', 'Testing', 'Clásicos'] });
      })
    );
  }

  createBook(bookData: any): Observable<any> {
    return this.http.post(
      `${this.BOOKS_API}/api/v1/books?tenant_id=${this.TENANT_ID}`,
      { ...bookData, tenant_id: this.TENANT_ID },
      { headers: this.getAuthHeaders() }
    );
  }

  updateBook(bookId: string, bookData: any): Observable<any> {
    return this.http.put(
      `${this.BOOKS_API}/api/v1/books/${bookId}?tenant_id=${this.TENANT_ID}`,
      bookData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteBook(bookId: string): Observable<any> {
    return this.http.delete(
      `${this.BOOKS_API}/api/v1/books/${bookId}?tenant_id=${this.TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getRecommendations(limit: number = 5): Observable<any> {
    return this.http.get(
      `${this.BOOKS_API}/api/v1/books/recommendations?tenant_id=${this.TENANT_ID}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching recommendations:', error);
        return of({ recommendations: [], total: 0, based_on: 'rating' });
      })
    );
  }

  getAuthors(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(
      `${this.BOOKS_API}/api/v1/books/authors?tenant_id=${this.TENANT_ID}&page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching authors:', error);
        return of({ data: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 20, has_next: false, has_previous: false } });
      })
    );
  }

  // ========================
  // CART & PURCHASES API METHODS - ORIGINAL NON-WORKING VERSION
  // ========================

  getCart(): Observable<Cart> {
    const user = this.getCurrentUser();
    if (!user) {
      return of({ cart_items: [], summary: { subtotal: 0, tax: 0, shipping: 0, total: 0 }, item_count: 0, updated_at: new Date().toISOString() });
    }

    return this.http.get<Cart>(
      `${this.PURCHASES_API}/api/v1/cart?user_id=${user.user_id}&tenant_id=${this.PURCHASES_TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching cart:', error);
        return of({ cart_items: [], summary: { subtotal: 0, tax: 0, shipping: 0, total: 0 }, item_count: 0, updated_at: new Date().toISOString() });
      })
    );
  }

  // Simple addToCart that doesn't work (original state)
  addToCart(bookId: string, quantity: number = 1): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.http.post(
      `${this.PURCHASES_API}/api/v1/cart`,
      {
        user_id: user.user_id,
        tenant_id: this.PURCHASES_TENANT_ID,
        book_id: bookId,
        quantity: quantity
      },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding to cart:', error);
        throw error;
      })
    );
  }

  clearCart(): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.http.post(
      `${this.PURCHASES_API}/api/v1/cart/clear`,
      {
        user_id: user.user_id,
        tenant_id: this.PURCHASES_TENANT_ID
      },
      { headers: this.getAuthHeaders() }
    );
  }

  checkout(paymentMethod: string, billingAddress: any, shippingAddress: any): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.http.post(
      `${this.PURCHASES_API}/api/v1/checkout`,
      {
        user_id: user.user_id,
        tenant_id: this.PURCHASES_TENANT_ID,
        payment_method: paymentMethod,
        billing_address: billingAddress,
        shipping_address: shippingAddress
      },
      { headers: this.getAuthHeaders() }
    );
  }

  getOrders(page: number = 1, limit: number = 10): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      return of({ items: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 10, has_next: false, has_previous: false } });
    }

    return this.http.get(
      `${this.PURCHASES_API}/api/v1/orders?user_id=${user.user_id}&tenant_id=${this.PURCHASES_TENANT_ID}&page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        return of({ items: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 10, has_next: false, has_previous: false } });
      })
    );
  }

  getPurchaseAnalytics(): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      return of({ analytics: { summary: { total_orders: 0, total_spent: 0, average_order_value: 0, completed_orders: 0, pending_orders: 0 }, monthly_stats: {} } });
    }

    return this.http.get(
      `${this.PURCHASES_API}/api/v1/analytics/purchases?user_id=${user.user_id}&tenant_id=${this.PURCHASES_TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching analytics:', error);
        return of({ analytics: { summary: { total_orders: 0, total_spent: 0, average_order_value: 0, completed_orders: 0, pending_orders: 0 }, monthly_stats: {} } });
      })
    );
  }

  // ========================
  // FAVORITES METHODS - FIXED VERSION
  // ========================

  getFavorites(page: number = 1, limit: number = 100): Observable<any> {
    console.log('API Service: Getting favorites, page:', page, 'limit:', limit); // Debug log
    
    // Use tenant1 for API calls, not the user's tenant_id
    return this.http.get(
      `${this.USERS_API}/api/v1/favorites?tenant_id=tenant1&page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        console.log('API Service: Get favorites successful:', response); // Debug log
      }),
      catchError(error => {
        console.error('API Service: Error fetching favorites:', error); // Debug log
        return of({ items: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: limit, has_next: false, has_previous: false } });
      })
    );
  }

  addToFavorites(bookId: string): Observable<any> {
    console.log('API Service: Adding to favorites, bookId:', bookId); // Debug log
    console.log('API Service: Using tenant_id:', 'tenant1'); // Debug log
    console.log('API Service: Auth headers:', this.getAuthHeaders()); // Debug log
    
    // Use tenant1 for API calls, not the user's tenant_id
    return this.http.post(
      `${this.USERS_API}/api/v1/favorites?tenant_id=tenant1`,
      { book_id: bookId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        console.log('API Service: Add to favorites successful:', response); // Debug log
      }),
      catchError(error => {
        console.error('API Service: Error adding to favorites:', error); // Debug log
        console.error('API Service: Error status:', error.status); // Debug log
        console.error('API Service: Error message:', error.message); // Debug log
        if (error.status === 409) {
          return of({ message: 'Book already in favorites' });
        }
        if (error.status === 400) {
          return of({ error: 'Invalid request - please check book ID' });
        }
        throw error;
      })
    );
  }

  removeFromFavorites(bookId: string): Observable<any> {
    // Use tenant1 for API calls, not the user's tenant_id
    return this.http.delete(
      `${this.USERS_API}/api/v1/favorites/${bookId}?tenant_id=tenant1`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error removing from favorites:', error);
        if (error.status === 404) {
          return of({ message: 'Book not in favorites' });
        }
        throw error;
      })
    );
  }

  clearAllFavorites(): Observable<any> {
    return this.getFavorites(1, 100).pipe(
      switchMap((response: any) => {
        const favorites = response.items || [];
        
        if (favorites.length === 0) {
          return of({ message: 'No favorites to clear', items_removed: 0, errors: 0 });
        }

        const deleteRequests: Observable<{ success: boolean; book_id: string }>[] = favorites.map((fav: any) => 
          this.removeFromFavorites(fav.book_id).pipe(
            map(() => ({ success: true, book_id: fav.book_id })),
            catchError(() => {
              console.error(`Error deleting favorite ${fav.book_id}`);
              return of({ success: false, book_id: fav.book_id });
            })
          )
        );

        return forkJoin(deleteRequests).pipe(
          map((results: { success: boolean; book_id: string }[]) => {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            return {
              message: failed > 0 
                ? `Cleared ${successful} favorites with ${failed} errors`
                : `Successfully cleared ${successful} favorites`,
              items_removed: successful,
              errors: failed
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error clearing all favorites:', error);
        throw error;
      })
    );
  }

  // ========================
  // WISHLIST METHODS - FIXED VERSION
  // ========================

  getWishlist(page: number = 1, limit: number = 10): Observable<any> {
    // Use tenant1 for API calls, not the user's tenant_id
    return this.http.get(
      `${this.USERS_API}/api/v1/wishlist?tenant_id=tenant1&page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching wishlist:', error);
        return of({ items: [], pagination: { current_page: 1, total_pages: 0, total_items: 0, items_per_page: 10, has_next: false, has_previous: false } });
      })
    );
  }

  addToWishlist(bookId: string, title: string, author: string): Observable<any> {
    // Use tenant1 for API calls, not the user's tenant_id
    return this.http.post(
      `${this.USERS_API}/api/v1/wishlist?tenant_id=tenant1`,
      { 
        book_id: bookId,
        title: title,
        author: author
      },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding to wishlist:', error);
        if (error.status === 400) {
          return of({ error: 'Invalid request - missing required fields' });
        } else if (error.status === 401) {
          return of({ error: 'Authentication required' });
        }
        throw error;
      })
    );
  }

  removeFromWishlist(bookId: string): Observable<any> {
    console.warn('Remove from wishlist endpoint does not exist in the Users API documentation');
    return of({ 
      error: 'Individual wishlist item removal is not supported by the Users API',
      limitation: true 
    });
  }

  clearAllWishlist(): Observable<any> {
    console.warn('Clear all wishlist endpoint does not exist in the Users API documentation');
    return of({ 
      error: 'Clear all wishlist is not supported by the Users API',
      limitation: true 
    });
  }

  // ========================
  // UTILITY METHODS
  // ========================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Health check methods
  checkUsersApiHealth(): Observable<any> {
    return this.http.get(`${this.USERS_API}/`);
  }

  checkBooksApiHealth(): Observable<any> {
    return this.http.get(`${this.BOOKS_API}/`);
  }

  checkPurchasesApiHealth(): Observable<any> {
    return this.http.get(`${this.PURCHASES_API}/`);
  }
}