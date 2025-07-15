// services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export const API_CONFIG = {
  USERS_API_URL: "https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev",
  BOOKS_API_URL: "https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev",
  PURCHASES_API_URL: "https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev",
  IMAGES_API_URL: "https://tn43twlsd7.execute-api.us-east-1.amazonaws.com/dev",
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
  getBooks(page: number = 1, limit: number = 12, category?: string): Observable<any> {
    let url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books?tenant_id=${API_CONFIG.DEFAULT_TENANT}&page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return this.http.get(url);
  }

  searchBooks(query: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/search?tenant_id=${API_CONFIG.DEFAULT_TENANT}&q=${encodeURIComponent(query)}`;
    return this.http.get(url);
  }

  getBookById(bookId: string): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/${bookId}?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url);
  }

  getBookRecommendations(limit: number = 8): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/recommendations?tenant_id=${API_CONFIG.DEFAULT_TENANT}&limit=${limit}`;
    return this.http.get(url);
  }

  getCategories(): Observable<any> {
    const url = `${API_CONFIG.BOOKS_API_URL}/api/v1/books/categories?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url);
  }

  // Cart methods
  getCart(userId: string): Observable<any> {
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart?user_id=${userId}&tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addToCart(bookId: string, quantity: number = 1): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart`;
    return this.http.post(url, {
      user_id: user.id,
      tenant_id: API_CONFIG.DEFAULT_TENANT,
      book_id: bookId,
      quantity
    }, { headers: this.getHeaders() });
  }

  updateCartQuantity(bookId: string, quantity: number): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart/update`;
    return this.http.post(url, {
      user_id: user.id,
      tenant_id: API_CONFIG.DEFAULT_TENANT,
      book_id: bookId,
      quantity
    }, { headers: this.getHeaders() });
  }

  clearCart(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart/clear`;
    return this.http.post(url, {
      user_id: user.id,
      tenant_id: API_CONFIG.DEFAULT_TENANT
    }, { headers: this.getHeaders() });
  }

  checkout(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/cart/checkout`;
    return this.http.post(url, {
      user_id: user.id,
      tenant_id: API_CONFIG.DEFAULT_TENANT
    }, { headers: this.getHeaders() });
  }

  // Orders methods
  getOrders(userId: string): Observable<any> {
    const url = `${API_CONFIG.PURCHASES_API_URL}/api/v1/orders?user_id=${userId}&tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
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

  // Wishlist methods
  getWishlist(): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/wishlist?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addToWishlist(bookId: string): Observable<any> {
    const url = `${API_CONFIG.USERS_API_URL}/api/v1/wishlist?tenant_id=${API_CONFIG.DEFAULT_TENANT}`;
    return this.http.post(url, { book_id: bookId }, { headers: this.getHeaders() });
  }

  updateCartItemsCount(count: number): void {
    this.cartItemsSubject.next(count);
  }
}