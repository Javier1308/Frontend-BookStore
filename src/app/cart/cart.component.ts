// src/app/cart/cart.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button 
          (click)="continueShopping()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Continue Shopping
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && cart.cart_items.length === 0" class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M7 13h10"></path>
        </svg>
        <p class="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <button 
          (click)="continueShopping()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Shopping
        </button>
      </div>

      <div *ngIf="!loading && cart.cart_items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Cart Items ({{ cart.item_count }})</h2>
            </div>
            
            <div class="divide-y divide-gray-200">
              <div *ngFor="let item of cart.cart_items" class="p-6 flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <img 
                    [src]="item.image_url || '/assets/book-placeholder.jpg'" 
                    [alt]="item.title"
                    class="w-20 h-28 object-cover rounded-md shadow-sm"
                    (error)="onImageError($event)">
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ item.title }}</h3>
                  <p class="text-sm text-gray-500">{{ item.author }}</p>
                  <p class="text-sm text-gray-500">ISBN: {{ item.isbn }}</p>
                  <p class="text-lg font-semibold text-blue-600 mt-2">\${{ item.price.toFixed(2) }}</p>
                </div>
                
                <div class="flex items-center space-x-3">
                  <button 
                    (click)="updateQuantity(item, item.quantity - 1)"
                    [disabled]="item.quantity <= 1"
                    class="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50">
                    -
                  </button>
                  
                  <span class="text-lg font-medium w-8 text-center">{{ item.quantity }}</span>
                  
                  <button 
                    (click)="updateQuantity(item, item.quantity + 1)"
                    class="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200">
                    +
                  </button>
                </div>
                
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">\${{ item.subtotal.toFixed(2) }}</p>
                  <button 
                    (click)="removeItem(item)"
                    class="text-red-600 hover:text-red-800 text-sm mt-2">
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200">
              <button 
                (click)="clearCart()"
                class="text-red-600 hover:text-red-800 text-sm">
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-gray-900">\${{ cart.summary.subtotal.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">Tax</span>
                <span class="text-gray-900">\${{ cart.summary.tax.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">
                  {{ cart.summary.shipping === 0 ? 'FREE' : '$' + cart.summary.shipping.toFixed(2) }}
                </span>
              </div>
              
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between text-lg font-semibold">
                  <span class="text-gray-900">Total</span>
                  <span class="text-gray-900">\${{ cart.summary.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="mt-6 space-y-3">
              <button 
                (click)="proceedToCheckout()"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Proceed to Checkout
              </button>
              
              <p class="text-xs text-gray-500 text-center">
                Free shipping on orders over $50
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  cart: Cart = {
    cart_items: [],
    summary: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
    item_count: 0,
    updated_at: ''
  };
  
  loading = false;

  ngOnInit() {
    this.loadCart();
  }

  continueShopping() {
    this.router.navigate(['/books']);
  }

  loadCart() {
    this.loading = true;
    this.apiService.getCart().subscribe({
      next: (response) => {
        this.cart = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    // Not implemented - this is the non-working state
    console.warn('Update quantity not implemented');
    alert('Update quantity feature not yet implemented');
  }

  removeItem(item: CartItem) {
    // Not implemented - this is the non-working state
    console.warn('Remove item not implemented');
    alert('Remove item feature not yet implemented');
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.apiService.clearCart().subscribe({
        next: (response) => {
          alert('Cart cleared successfully!');
          this.loadCart();
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          alert('Error clearing cart');
        }
      });
    }
  }

  proceedToCheckout() {
    // Not implemented - this is the non-working state
    console.warn('Checkout not implemented');
    alert('Checkout feature not yet implemented');
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/book-placeholder.jpg';
    }
  }
}