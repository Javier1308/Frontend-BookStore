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

  // Helper method to get tenant ID from token or use default
  private getTenantId(): string {
    // Based on the Books API documentation, use tenant1 for Books API
    return 'tenant1';
  }

  // Search books by text - Enhanced for ElasticSearch integration
  searchBooks(query: string, category?: string, page: number = 1, limit: number = 20): Observable<any> {
    // Build parameters exactly as documented
    let params = new HttpParams()
      .set('tenant_id', 'tenant1')
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category && category.trim()) {
      params = params.set('category', category);
    }

    const url = `${this.BOOKS_API}/api/v1/books/search`;
    const fullUrl = `${url}?${params.toString()}`;

    console.log('=== ELASTICSEARCH SEARCH BOOKS API CALL ===');
    console.log('URL:', url);
    console.log('Full URL:', fullUrl);
    console.log('ElasticSearch IP (should be):', '44.222.79.214:9201');
    console.log('Parameters:', {
      tenant_id: 'tenant1',
      q: query,
      page: page,
      limit: limit,
      category: category || 'none'
    });

    // Use proper authentication headers as documented
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);

    return this.http.get(url, { 
      params,
      headers: headers
    }).pipe(
      tap(response => {
        console.log('=== ELASTICSEARCH SEARCH BOOKS API RESPONSE ===');
        console.log('Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        if (response && typeof response === 'object') {
          console.log('Response keys:', Object.keys(response));
          if ((response as any).data) {
            console.log('ElasticSearch data array length:', (response as any).data.length);
            console.log('First ElasticSearch item:', (response as any).data[0]);
          }
        }
      }),
      catchError(error => {
        console.error('=== ELASTICSEARCH SEARCH BOOKS API ERROR ===');
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('URL:', error.url);
        console.error('Error response:', error.error);
        console.error('ElasticSearch IP should be:', '44.222.79.214:9201');
        
        // Enhanced error logging for ElasticSearch issues
        if (error.status === 502 || error.status === 503) {
          console.error('ELASTICSEARCH CONNECTION ISSUE - Backend may need IP update to 44.222.79.214:9201');
        } else if (error.status === 500) {
          console.error('ELASTICSEARCH SERVER ERROR - Check backend ElasticSearch configuration');
        }
        
        // Re-throw the error so the component can handle it
        throw error;
      })
    );
  }

  // Search book by ISBN - Enhanced for ElasticSearch
  searchBookByISBN(isbn: string): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1');

    const url = `${this.BOOKS_API}/api/v1/books/by-isbn/${isbn}`;
    const fullUrl = `${url}?${params.toString()}`;

    console.log('=== ELASTICSEARCH ISBN SEARCH API CALL ===');
    console.log('URL:', url);
    console.log('Full URL:', fullUrl);
    console.log('ISBN:', isbn);
    console.log('ElasticSearch IP (should be):', '44.222.79.214:9201');
    console.log('Parameters:', { tenant_id: 'tenant1' });

    return this.http.get(url, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('=== ELASTICSEARCH ISBN SEARCH API RESPONSE ===');
        console.log('Response:', response);
        console.log('ElasticSearch found ISBN:', isbn);
      }),
      catchError(error => {
        console.error('=== ELASTICSEARCH ISBN SEARCH API ERROR ===');
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('URL:', error.url);
        console.error('Error response:', error.error);
        console.error('ElasticSearch IP should be:', '44.222.79.214:9201');
        
        if (error.status === 404) {
          console.log('ISBN not found in ElasticSearch:', isbn);
          // Return null for not found instead of throwing error
          return of(null);
        }
        
        // Re-throw other errors so the component can handle them
        throw error;
      })
    );
  }

  // Books API methods - Fixed to match documentation
  getBooks(page: number = 1, limit: number = 20, category?: string, sortBy?: string): Observable<any> {
    let params = new HttpParams()
      .set('tenant_id', 'tenant1')
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category && category.trim()) {
      params = params.set('category', category);
    }
    if (sortBy && sortBy.trim()) {
      params = params.set('sort', sortBy);
    }

    console.log('=== GET BOOKS API CALL ===');
    console.log('Books API request params:', params.toString());

    return this.http.get(`${this.BOOKS_API}/api/v1/books`, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('=== GET BOOKS API RESPONSE ===');
        console.log('Books API raw response:', response);
      }),
      catchError(error => {
        console.error('=== GET BOOKS API ERROR ===');
        console.error('Books API error:', error);
        throw error;
      })
    );
  }

  getCategories(): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1');

    return this.http.get(`${this.BOOKS_API}/api/v1/books/categories`, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('Categories API response:', response);
      }),
      catchError(error => {
        console.error('Categories API error:', error);
        throw error;
      })
    );
  }

  getBookById(bookId: string): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1'); // Use tenant1 directly

    return this.http.get(`${this.BOOKS_API}/api/v1/books/${bookId}`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  createBook(bookData: any): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1'); // Use tenant1 directly

    // Ensure tenant_id is included in the book data
    const dataWithTenant = {
      ...bookData,
      tenant_id: 'tenant1'
    };

    return this.http.post(`${this.BOOKS_API}/api/v1/books`, dataWithTenant, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  updateBook(bookId: string, bookData: any): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1'); // Use tenant1 directly

    return this.http.put(`${this.BOOKS_API}/api/v1/books/${bookId}`, bookData, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  deleteBook(bookId: string): Observable<any> {
    const params = new HttpParams()
      .set('tenant_id', 'tenant1'); // Use tenant1 directly

    return this.http.delete(`${this.BOOKS_API}/api/v1/books/${bookId}`, { 
      params,
      headers: this.getAuthHeaders()
    });
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
  // PROFILE METHODS - FIXED VERSION
  // ========================

  getProfile(): Observable<any> {
    return this.http.get(
      `${this.USERS_API}/api/v1/profile?tenant_id=${this.TENANT_ID}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(
      `${this.USERS_API}/api/v1/profile?tenant_id=${this.TENANT_ID}`,
      profileData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((response: any) => {
        // Update current user in localStorage
        const currentUser = this.getCurrentUser();
        if (currentUser && response.user) {
          const updatedUser = { ...currentUser, ...response.user };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.USERS_API}/api/v1/change-password?tenant_id=${this.TENANT_ID}`,
      { 
        current_password: currentPassword,
        new_password: newPassword 
      },
      { headers: this.getAuthHeaders() }
    );
  }

  uploadProfileImage(file: File): Observable<any> {
    // Create a more realistic simulation
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Simulate upload delay
        setTimeout(() => {
          const imageUrl = e.target?.result as string;
          observer.next({ 
            message: 'Profile image uploaded successfully',
            profile_image_url: imageUrl
          });
          observer.complete();
        }, 1000);
      };
      reader.readAsDataURL(file);
    });
  }

  removeProfileImage(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'Profile image removed successfully' });
        observer.complete();
      }, 500);
    });
  }

  // ========================
  // UTILITY METHODS
  // ========================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    console.log('Auth headers created with token:', token ? 'present' : 'missing');
    return headers;
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

  // Add ElasticSearch health check method
  checkElasticSearchHealth(): Observable<any> {
    console.log('Checking ElasticSearch health at 44.222.79.214:9201');
    // This would be used if we could directly connect to ElasticSearch
    // For now, it's just for documentation purposes
    return of({
      message: 'ElasticSearch health check not directly accessible from frontend',
      expected_ip: '44.222.79.214:9201',
      tenant1_port: '9201',
      tenant2_port: '9202',
      note: 'Backend needs to be updated to use new IP'
    });
  }
}