// src/app/profile/profile.component.ts - COMPLETO
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
}

interface Order {
  order_id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

interface FavoriteItem {
  book_id: string;
  title: string;
  author: string;
  price: number;
  added_at: string;
}

interface WishlistItem {
  book_id: string;
  title: string;
  author: string;
  added_at: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profile Details -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-6">
              <div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{user?.first_name || 'N/A'}} {{user?.last_name || ''}}</h2>
                <p class="text-gray-600">{{user?.email || 'N/A'}}</p>
                <p class="text-sm text-gray-500">{{user?.role || 'N/A'}} • Member since {{getMemberSince()}}</p>
              </div>
            </div>

            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              
              <form (ngSubmit)="updateProfile()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileForm.username" 
                    name="username"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      [(ngModel)]="profileForm.first_name" 
                      name="first_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      [(ngModel)]="profileForm.last_name" 
                      name="last_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="profileForm.phone" 
                    name="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div *ngIf="profileError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600 text-sm">{{profileError}}</p>
                </div>

                <div *ngIf="profileSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p class="text-green-600 text-sm">{{profileSuccess}}</p>
                </div>

                <button 
                  type="submit" 
                  [disabled]="profileLoading"
                  class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {{profileLoading ? 'Updating...' : 'Update Profile'}}
                </button>
              </form>
            </div>
          </div>

          <!-- Change Password -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
            
            <form (ngSubmit)="changePassword()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordForm.current_password" 
                  name="current_password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordForm.new_password" 
                  name="new_password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div *ngIf="passwordError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm">{{passwordError}}</p>
              </div>

              <div *ngIf="passwordSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-green-600 text-sm">{{passwordSuccess}}</p>
              </div>

              <button 
                type="submit" 
                [disabled]="passwordLoading"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {{passwordLoading ? 'Changing...' : 'Change Password'}}
              </button>
            </form>
          </div>

          <!-- Orders History -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Order History</h3>
            
            <div *ngIf="ordersLoading" class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            
            <div *ngIf="!ordersLoading && orders.length === 0" class="text-center py-8">
              <svg class="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <p class="text-gray-500">No orders yet</p>
            </div>
            
            <div *ngIf="!ordersLoading && orders.length > 0" class="space-y-4">
              <div *ngFor="let order of orders" class="border rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-800">Order #{{order.order_id.slice(-8)}}</p>
                    <p class="text-sm text-gray-600">{{order.created_at | date:'mediumDate'}}</p>
                    <p class="text-sm text-gray-500">{{order.items?.length || 0}} items</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-800">\${{order.total.toFixed(2)}}</p>
                    <span [class]="getStatusClass(order.status)" class="text-xs px-2 py-1 rounded-full">
                      {{order.status}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Account Stats -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Account Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Orders</span>
                <span class="font-semibold">{{orders.length}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Spent</span>
                <span class="font-semibold">\${{getTotalSpent().toFixed(2)}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Favorites</span>
                <span class="font-semibold">{{favorites.length}}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Wishlist</span>
                <span class="font-semibold">{{wishlist.length}}</span>
              </div>
            </div>
          </div>

          <!-- Recent Favorites -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Favorites</h3>
            
            <div *ngIf="favoritesLoading" class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            
            <div *ngIf="!favoritesLoading && favorites.length === 0" class="text-center py-4">
              <p class="text-gray-500 text-sm">No favorites yet</p>
            </div>
            
            <div *ngIf="!favoritesLoading && favorites.length > 0" class="space-y-3">
              <div *ngFor="let fav of favorites.slice(0, 3)" class="border-b pb-3 last:border-b-0 last:pb-0">
                <p class="font-medium text-gray-800 text-sm">{{fav.title}}</p>
                <p class="text-gray-600 text-xs">by {{fav.author}}</p>
                <p class="text-blue-600 text-xs font-semibold">\${{fav.price}}</p>
              </div>
            </div>
          </div>

          <!-- Recent Wishlist -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Wishlist</h3>
            
            <div *ngIf="wishlistLoading" class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            
            <div *ngIf="!wishlistLoading && wishlist.length === 0" class="text-center py-4">
              <p class="text-gray-500 text-sm">No wishlist items yet</p>
            </div>
            
            <div *ngIf="!wishlistLoading && wishlist.length > 0" class="space-y-3">
              <div *ngFor="let item of wishlist.slice(0, 3)" class="border-b pb-3 last:border-b-0 last:pb-0">
                <p class="font-medium text-gray-800 text-sm">{{item.title}}</p>
                <p class="text-gray-600 text-xs">by {{item.author}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  
  user: User | null = null;
  orders: Order[] = [];
  favorites: FavoriteItem[] = [];
  wishlist: WishlistItem[] = [];
  
  ordersLoading = false;
  favoritesLoading = false;
  wishlistLoading = false;
  profileLoading = false;
  passwordLoading = false;
  
  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  profileForm = {
    username: '',
    first_name: '',
    last_name: '',
    phone: ''
  };

  passwordForm = {
    current_password: '',
    new_password: ''
  };

  ngOnInit() {
    this.loadUserProfile();
    this.loadOrders();
    this.loadFavorites();
    this.loadWishlist();
  }

  loadUserProfile() {
    const token = localStorage.getItem('token');
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/profile?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.user = response.user;
        this.profileForm = {
          username: this.user?.username || '',
          first_name: this.user?.first_name || '',
          last_name: this.user?.last_name || '',
          phone: this.user?.phone || ''
        };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Try to get user from localStorage as fallback
        const userData = localStorage.getItem('user');
        if (userData) {
          this.user = JSON.parse(userData);
          this.profileForm = {
            username: this.user?.username || '',
            first_name: this.user?.first_name || '',
            last_name: this.user?.last_name || '',
            phone: this.user?.phone || ''
          };
        }
      }
    });
  }

  loadOrders() {
    this.ordersLoading = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user.user_id) {
      this.ordersLoading = false;
      return;
    }

    const url = `https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/orders?user_id=${user.user_id}&tenant_id=${user.tenant_id || 'tenant1'}`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.orders = response.items || [];
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.ordersLoading = false;
      }
    });
  }

  loadFavorites() {
    this.favoritesLoading = true;
    const token = localStorage.getItem('token');
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/favorites?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.favorites = response.items || [];
        this.favoritesLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favorites = [];
        this.favoritesLoading = false;
      }
    });
  }

  loadWishlist() {
    this.wishlistLoading = true;
    const token = localStorage.getItem('token');
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/wishlist?tenant_id=tenant1`;
    
    this.http.get<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.wishlist = response.items || [];
        this.wishlistLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.wishlist = [];
        this.wishlistLoading = false;
      }
    });
  }

  updateProfile() {
    this.profileLoading = true;
    this.profileError = '';
    this.profileSuccess = '';
    
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/profile?tenant_id=tenant1`;
    const token = localStorage.getItem('token');
    
    this.http.put(url, this.profileForm, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        if (response.user) {
          this.user = { ...this.user, ...response.user };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        this.profileSuccess = 'Profile updated successfully!';
        this.profileLoading = false;
        
        setTimeout(() => {
          this.profileSuccess = '';
        }, 3000);
      },
      error: (error) => {
        this.profileError = error.error?.error || error.error?.message || 'Error updating profile';
        this.profileLoading = false;
      }
    });
  }

  changePassword() {
    if (!this.passwordForm.current_password || !this.passwordForm.new_password) {
      this.passwordError = 'Both current and new password are required';
      return;
    }

    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';
    
    const url = `https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev/api/v1/change-password?tenant_id=tenant1`;
    const token = localStorage.getItem('token');
    
    this.http.post(url, {
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm = {
          current_password: '',
          new_password: ''
        };
        this.passwordLoading = false;
        
        setTimeout(() => {
          this.passwordSuccess = '';
        }, 3000);
      },
      error: (error) => {
        this.passwordError = error.error?.error || error.error?.message || 'Error changing password';
        this.passwordLoading = false;
      }
    });
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getMemberSince(): string {
    if (!this.user?.created_at) return 'N/A';
    return new Date(this.user.created_at).getFullYear().toString();
  }

  getStatusClass(status: string): string {
    const baseClasses = 'text-xs px-2 py-1 rounded-full font-semibold';
    switch (status?.toLowerCase()) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}