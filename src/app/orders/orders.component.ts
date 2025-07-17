import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Orders</h1>
        <button 
          (click)="goBack()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Back to Cart
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-12">
        <svg class="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="text-gray-500 text-lg mb-4">No orders yet</p>
        <button 
          (click)="goToCart()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Shopping
        </button>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="space-y-6">
        <div *ngFor="let order of orders" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.order_id }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">\${{ order.total.toFixed(2) }}</p>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="order.status === 'completed'"
                    [class.text-green-800]="order.status === 'completed'"
                    [class.bg-yellow-100]="order.status === 'pending'"
                    [class.text-yellow-800]="order.status === 'pending'">
                {{ order.status }}
              </span>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <div *ngFor="let item of order.items" class="flex justify-between items-center py-2">
              <div>
                <p class="font-medium text-gray-900">{{ item.title }}</p>
                <p class="text-sm text-gray-500">{{ item.author }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-900">Qty: {{ item.quantity }}</p>
                <p class="text-sm text-gray-900">\${{ item.subtotal.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  orders: any[] = [];
  loading = false;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.apiService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.items || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
