import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Purchase Analytics</h1>
        <button 
          (click)="goBack()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Back to Cart
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && analytics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Orders</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics.summary.total_orders }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Spent</p>
              <p class="text-2xl font-semibold text-gray-900">\${{ analytics.summary.total_spent.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Average Order</p>
              <p class="text-2xl font-semibold text-gray-900">\${{ analytics.summary.average_order_value.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Completed Orders</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics.summary.completed_orders }}</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && analytics" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Monthly Statistics</h2>
        <div *ngIf="hasMonthlyStats; else noStats">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div *ngFor="let month of monthlyStatsArray" class="border rounded-lg p-4">
              <h3 class="font-medium text-gray-900">{{ month.month }}</h3>
              <p class="text-sm text-gray-500">Orders: {{ month.orders }}</p>
              <p class="text-sm text-gray-500">Total: \${{ month.total.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <ng-template #noStats>
          <p class="text-gray-500">No monthly statistics available yet.</p>
        </ng-template>
      </div>

      <div *ngIf="!loading" class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Analytics generated at: {{ formatDate(analytics?.generated_at) }}
        </p>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  analytics: any = null;
  loading = false;
  monthlyStatsArray: any[] = [];
  hasMonthlyStats = false;

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.apiService.getPurchaseAnalytics().subscribe({
      next: (response) => {
        this.analytics = response.analytics;
        this.processMonthlyStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  processMonthlyStats() {
    if (this.analytics?.monthly_stats) {
      this.monthlyStatsArray = Object.entries(this.analytics.monthly_stats).map(([month, stats]: [string, any]) => ({
        month,
        orders: stats.orders || 0,
        total: stats.total || 0
      }));
      this.hasMonthlyStats = this.monthlyStatsArray.length > 0;
    }
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
