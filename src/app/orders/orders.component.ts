import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Orders</h1>
        <button 
          (click)="goToBooks()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Continue Shopping
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- No orders state -->
      <div *ngIf="!loading && orders.length === 0" class="text-center py-16">
        <div class="mx-auto w-24 h-24 text-gray-400 mb-6">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No purchases made yet</h3>
        <p class="text-gray-500 text-lg mb-8">You haven't placed any orders yet. Start shopping to see your purchase history here.</p>
        
        <div class="space-y-4">
          <button 
            (click)="goToBooks()"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
            Start Shopping
          </button>
          
          <div class="flex justify-center space-x-4 text-sm">
            <button 
              (click)="goToFavorites()"
              class="text-blue-600 hover:text-blue-800 transition-colors">
              View Favorites
            </button>
            <span class="text-gray-300">|</span>
            <button 
              (click)="goToWishlist()"
              class="text-blue-600 hover:text-blue-800 transition-colors">
              View Wishlist
            </button>
          </div>
        </div>
      </div>

      <!-- Orders list -->
      <div *ngIf="!loading && orders.length > 0" class="space-y-6">
        <div *ngFor="let order of orders" class="bg-white rounded-lg shadow-md overflow-hidden">
          
          <!-- Order Header -->
          <div class="bg-gray-50 px-6 py-4 border-b">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Order #{{ getOrderId(order.order_id) }}</h3>
                  <p class="text-sm text-gray-600">Placed on {{ formatDate(order.created_at) }}</p>
                </div>
                <div class="flex items-center">
                  <span class="px-3 py-1 text-xs font-medium rounded-full"
                        [ngClass]="getStatusClass(order.status)">
                    {{ order.status | titlecase }}
                  </span>
                </div>
              </div>
              <div class="mt-4 md:mt-0 text-right">
                <p class="text-xl font-bold text-gray-900">\${{ formatPrice(order.total_amount) }}</p>
                <p class="text-sm text-gray-600">{{ getItemCount(order.items) }} item(s)</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let item of order.items" class="flex items-center space-x-4">
                <img 
                  [src]="getItemImage(item)" 
                  [alt]="item.title"
                  class="w-16 h-16 object-cover rounded-lg border"
                  (error)="onImageError($event)">
                
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600">by {{ item.author }}</p>
                  <p class="text-sm text-gray-500">ISBN: {{ item.isbn }}</p>
                </div>
                
                <div class="text-right">
                  <p class="font-medium text-gray-900">\${{ formatPrice(item.price) }}</p>
                  <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                  <p class="text-xs text-gray-500">Subtotal: \${{ formatPrice(item.subtotal) }}</p>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-start">
                <div class="flex space-x-4">
                  <button 
                    (click)="viewOrderDetails(order.order_id)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                  <button 
                    *ngIf="order.status === 'pending' || order.status === 'processing'"
                    (click)="cancelOrder(order.order_id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium">
                    Cancel Order
                  </button>
                  <button 
                    *ngIf="order.status === 'delivered'"
                    (click)="reorderItems(order)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium">
                    Reorder
                  </button>
                </div>
                
                <div class="text-right space-y-1">
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Payment:</span> {{ order.payment_method | titlecase }}
                  </div>
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Status:</span> {{ order.status | titlecase }}
                  </div>
                  <div *ngIf="order.tracking_number" class="text-sm text-gray-600">
                    <span class="font-medium">Tracking:</span> {{ order.tracking_number }}
                  </div>
                </div>
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
    console.log('OrdersComponent initialized - URL should be /orders');
    
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    console.log('Loading orders...');
    
    this.apiService.getOrders(1, 10).subscribe({
      next: (response) => {
        this.orders = response.items || [];
        this.loading = false;
        
        console.log('Orders loaded:', this.orders.length);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.loading = false;
        
        // Show error message
        this.showMessage('Error loading orders. Please try again.', 'error');
      }
    });
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  viewOrderDetails(orderId: string) {
    this.showMessage(`Order details for #${this.getOrderId(orderId)} - Feature coming soon!`, 'info');
  }

  cancelOrder(orderId: string) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.showMessage('Order cancellation feature coming soon!', 'warning');
    }
  }

  reorderItems(order: any) {
    if (confirm('Add these items to your cart again?')) {
      this.showMessage('Reorder feature coming soon!', 'info');
    }
  }

  // Helper methods
  getOrderId(orderId: string): string {
    return orderId ? orderId.substring(0, 8) : 'N/A';
  }

  getStatusClass(status: string): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  formatPrice(price: number): string {
    return price ? price.toFixed(2) : '0.00';
  }

  getItemCount(items: any[]): number {
    return items ? items.length : 0;
  }

  getItemImage(item: any): string {
    return item.image_url || item.cover_image_url || '/assets/book-placeholder.jpg';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/book-placeholder.jpg';
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const notification = document.createElement('div');
    let bgColor = 'bg-green-500';
    
    switch (type) {
      case 'error':
        bgColor = 'bg-red-500';
        break;
      case 'warning':
        bgColor = 'bg-yellow-500';
        break;
      case 'info':
        bgColor = 'bg-blue-500';
        break;
      default:
        bgColor = 'bg-green-500';
    }
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }
}
