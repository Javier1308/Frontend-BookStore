// services/api.service.ts - UPDATED VERSION
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export const API_CONFIG = {
  USERS_API_URL: "https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev",
  BOOKS_API_URL: "https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev",
  PURCHASES_API_URL: "https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev",
  IMAGES_API_URL: "https://tn43twlsd7.execute-api.us-east-1.amazonaws.com/dev",
  ELASTICSEARCH_URL: "http://3.237.90.90", // Nueva IP de Elasticsearch
  DEFAULT_TENANT: "tenant1",
  TIMEOUT: 30000,
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private cartItemsSubject = new BehaviorSubject<number>(0);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  // Auth methods
  login(credentials: { email: string; password: string }): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/login?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, credentials);
  }

  register(userData: { email: string; password: string; first_name: string; last_name: string }): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/register?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, userData);
  }

  validateToken(): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/validate-token?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Books methods
  getBooks(page: number = 1, limit: number = 12, category?: string, sort?: string): Observable<any> {
    let url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books?tenant_id=${API_CONFIG.DEFAULT_TENANT}&page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (sort) {
      url += `&sort=${sort}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Búsqueda normal con soporte para fuzzy
  searchBooks(query: string, fuzzy: boolean = false): Observable<any> {
    let url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/search?tenant_id=${API_CONFIG.DEFAULT_TENANT}&q=${encodeURIComponent(query)}`;
    if (fuzzy) {
      url += `&fuzzy=true`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Búsqueda con autocompletado
  getAutocompleteSuggestions(query: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/search?tenant_id=${API_CONFIG.DEFAULT_TENANT}&q=${encodeURIComponent(query)}&suggest=true&limit=5`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Búsqueda por prefijo
  searchByPrefix(prefix: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/search?tenant_id=${API_CONFIG.DEFAULT_TENANT}&q=${encodeURIComponent(prefix)}&prefix=true`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getBookById(bookId: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // CRUD Operations for Books
  createBook(bookData: any): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, { ...bookData, tenant_id: API_CONFIG.DEFAULT_TENANT }, { headers: this.getHeaders() });
  }

  updateBook(bookId: string, bookData: any): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.put(url, bookData, { headers: this.getHeaders() });
  }

  deleteBook(bookId: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }

  getBookRecommendations(limit: number = 8): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/recommendations?tenant_id=${API_CONFIG.DEFAULT_TENANT}&limit=${limit}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getCategories(): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/categories?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Cart methods
  getCart(userId: string): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Always use tenant1 for cart operations since that's where books are stored
    const tenantId = 'tenant1';
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart?user_id=${userId}&tenant_id=${tenantId}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addToCart(bookId: string, quantity: number = 1): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart`;
    
    // Always use tenant1 for cart operations since that's where books are stored
    const tenantId = 'tenant1';
    
    console.log('Adding to cart:', {
      user_id: user.user_id,
      tenant_id: tenantId,
      book_id: bookId,
      quantity
    });
    
    return this.http.post(url, {
      user_id: user.user_id,
      tenant_id: tenantId,
      book_id: bookId,
      quantity
    }, { headers: this.getHeaders() });
  }

  updateCartQuantity(bookId: string, quantity: number): Observable<any> {
    // The API doesn't have a separate update endpoint
    // According to the documentation, POST /api/v1/cart updates quantity if item exists
    return this.addToCart(bookId, quantity);
  }

  removeFromCart(bookId: string): Observable<any> {
    // Since the API doesn't have a remove endpoint, we need to use the clear cart approach
    // or implement a custom removal logic
    return this.clearCart();
  }

  clearCart(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart/clear`;
    // Always use tenant1 for cart operations since that's where books are stored
    const tenantId = 'tenant1';
    
    return this.http.post(url, {
      user_id: user.user_id,
      tenant_id: tenantId
    }, { headers: this.getHeaders() });
  }

  checkout(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart/checkout`;
    const tenantId = user.tenant_id || API_CONFIG.DEFAULT_TENANT;
    
    return this.http.post(url, {
      user_id: user.user_id,
      tenant_id: tenantId
    }, { headers: this.getHeaders() });
  }

  // Orders/Purchases methods
  getOrders(userId: string): Observable<any> {
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/orders?user_id=${userId}&tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getPurchases(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/purchases?user_id=${user.user_id}&tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Profile methods
  getProfile(): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/profile?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  updateProfile(profileData: any): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/profile?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.put(url, profileData, { headers: this.getHeaders() });
  }

  changePassword(passwordData: { current_password: string; new_password: string }): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/change-password?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, passwordData, { headers: this.getHeaders() });
  }

  // Favorites methods
  getFavorites(): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/favorites?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addToFavorites(bookId: string): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/favorites?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, { book_id: bookId }, { headers: this.getHeaders() });
  }

  removeFromFavorites(bookId: string): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/favorites/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }

  // Wishlist methods
  getWishlist(): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/wishlist?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addToWishlist(bookId: string, title?: string, author?: string): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/wishlist?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    const body: any = { book_id: bookId };
    if (title) body.title = title;
    if (author) body.author = author;
    return this.http.post(url, body, { headers: this.getHeaders() });
  }

  removeFromWishlist(bookId: string): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/wishlist/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }

  updateCartItemsCount(count: number): void {
    this.cartItemsSubject.next(count);
  }
}