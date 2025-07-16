// src/app/cart/cart.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

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

interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartResponse {
  cart_items: CartItem[];
  summary: CartSummary;
  item_count: number;
  updated_at: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div *ngIf="loading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && (!cart || cart.cart_items.length === 0)" class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2a1 1 0 00.9 1.8h10.8"></path>
        </svg>
        <p class="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <button 
          (click)="continueShopping()"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Continue Shopping
        </button>
      </div>

      <div *ngIf="!loading && cart && cart.cart_items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold text-gray-800">Cart Items ({{cart.item_count}})</h2>
            </div>
            
            <div class="divide-y">
              <div *ngFor="let item of cart.cart_items" class="p-6 flex items-center space-x-4">
                <img 
                  [src]="item.image_url || '/assets/book-placeholder.jpg'" 
                  [alt]="item.title"
                  class="w-16 h-20 object-cover rounded-md">
                
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 mb-1">{{item.title}}</h3>
                  <p class="text-gray-600 text-sm mb-2">by {{item.author}}</p>
                  <p class="text-gray-500 text-xs mb-2">ISBN: {{item.isbn}}</p>
                  <p class="text-blue-600 font-semibold">\${{item.price}}</p>
                </div>
                
                <div class="flex items-center space-x-3">
                  <button 
                    (click)="updateQuantity(item.book_id, item.quantity - 1)"
                    [disabled]="item.quantity <= 1 || updating"
                    class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  
                  <span class="w-8 text-center font-semibold">{{item.quantity}}</span>
                  
                  <button 
                    (click)="updateQuantity(item.book_id, item.quantity + 1)"
                    [disabled]="updating"
                    class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                </div>
                
                <div class="text-right">
                  <p class="font-semibold text-gray-800">\${{item.subtotal.toFixed(2)}}</p>
                  <button 
                    (click)="removeItem(item.book_id)"
                    [disabled]="updating"
                    class="text-red-600 hover:text-red-800 text-sm mt-1 disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>\${{cart.summary.subtotal.toFixed(2)}}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>\${{cart.summary.tax.toFixed(2)}}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span *ngIf="cart.summary.shipping > 0">\${{cart.summary.shipping.toFixed(2)}}</span>
                <span *ngIf="cart.summary.shipping === 0" class="text-green-600 font-semibold">FREE</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between text-lg font-semibold text-gray-800">
                  <span>Total</span>
                  <span>\${{cart.summary.total.toFixed(2)}}</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <button 
                (click)="checkout()"
                [disabled]="checkoutLoading || cart.cart_items.length === 0"
                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {{checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}}
              </button>
              
              <button 
                (click)="continueShopping()"
                class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                Continue Shopping
              </button>
              
              <button 
                (click)="clearCart()"
                [disabled]="updating"
                class="w-full text-red-600 hover:text-red-800 py-2 text-sm disabled:opacity-50">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm">{{error}}</p>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiService = inject(ApiService);
  
  cart: CartResponse | null = null;
  loading = false;
  updating = false;
  checkoutLoading = false;
  error = '';

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.error = '';
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.user_id) {
      this.error = 'User not found. Please login again.';
      this.loading = false;
      return;
    }

    this.apiService.getCart(user.user_id).subscribe({
      next: (response) => {
        this.cart = response;
        this.loading = false;
        // Update cart items count in the service
        this.apiService.updateCartItemsCount(response.item_count || 0);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    });
  }

  updateQuantity(bookId: string, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(bookId);
      return;
    }
    
    this.updating = true;
    this.error = '';
    
    this.apiService.updateCartQuantity(bookId, newQuantity).subscribe({
      next: () => {
        this.loadCart();
        this.updating = false;
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.error = error.error?.error || 'Failed to update quantity. Please try again.';
        this.updating = false;
      }
    });
  }

  removeItem(bookId: string) {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }
    
    this.updating = true;
    this.error = '';
    
    // Since the API doesn't have a proper remove endpoint, we'll use the manual approach
    this.removeItemManually(bookId);
  }

  private removeItemManually(bookIdToRemove: string) {
    // Get current cart items
    const currentItems = this.cart?.cart_items || [];
    const itemsToKeep = currentItems.filter(item => item.book_id !== bookIdToRemove);
    
    // Clear the cart first
    this.apiService.clearCart().subscribe({
      next: () => {
        // Re-add items we want to keep
        if (itemsToKeep.length > 0) {
          this.reAddItems(itemsToKeep);
        } else {
          this.loadCart();
          this.updating = false;
        }
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.error = 'Failed to remove item. Please try again.';
        this.updating = false;
      }
    });
  }

  private reAddItems(items: any[]) {
    let itemsAdded = 0;
    const totalItems = items.length;
    
    items.forEach(item => {
      this.apiService.addToCart(item.book_id, item.quantity).subscribe({
        next: () => {
          itemsAdded++;
          if (itemsAdded === totalItems) {
            this.loadCart();
            this.updating = false;
          }
        },
        error: (error) => {
          console.error('Error re-adding item:', error);
          itemsAdded++;
          if (itemsAdded === totalItems) {
            this.loadCart();
            this.updating = false;
          }
        }
      });
    });
  }

  clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }
    
    this.updating = true;
    this.error = '';
    
    this.apiService.clearCart().subscribe({
      next: (response: any) => {
        console.log('Cart cleared:', response);
        this.loadCart();
        this.updating = false;
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.error = 'Failed to clear cart. Please try again.';
        this.updating = false;
      }
    });
  }

  checkout() {
    this.checkoutLoading = true;
    this.error = '';
    
    // First try the simple checkout method from API service
    this.apiService.checkout().subscribe({
      next: (response: any) => {
        console.log('Checkout successful:', response);
        this.showSuccessMessage('Order placed successfully!');
        this.checkoutLoading = false;
        this.router.navigate(['/profile']); // Redirect to orders
      },
      error: (error) => {
        console.error('Error during simple checkout:', error);
        
        // Fallback to detailed checkout if simple checkout fails
        this.detailedCheckout();
      }
    });
  }

  private detailedCheckout() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const url = 'https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev/api/v1/checkout';
    
    // Prepare checkout data according to Purchases API documentation
    const checkoutData = {
      user_id: user.user_id,
      tenant_id: user.tenant_id || 'tenant1',
      payment_method: 'credit_card',
      billing_address: {
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer',
        street: '123 Main St', // Default address
        city: 'City',
        country: 'Country',
        postal_code: '12345'
      },
      shipping_address: {
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer',
        street: '123 Main St', // Default address
        city: 'City',
        country: 'Country',
        postal_code: '12345'
      }
    };
    
    this.http.post(url, checkoutData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        console.log('Detailed checkout successful:', response);
        this.showSuccessMessage('Order placed successfully!');
        this.checkoutLoading = false;
        this.router.navigate(['/profile']); // Redirect to orders
      },
      error: (error) => {
        console.error('Error during detailed checkout:', error);
        this.error = error.error?.error || 'Checkout failed. Please try again.';
        this.checkoutLoading = false;
      }
    });
  }

  private showSuccessMessage(message: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }

  continueShopping() {
    this.router.navigate(['/books']);
  }
}