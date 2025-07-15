import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex justify-center mt-8" *ngIf="totalPages > 1">
      <div class="flex space-x-2">
        <button 
          (click)="onPageChange(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        
        <button 
          *ngFor="let page of getVisiblePages()"
          (click)="onPageChange(page)"
          [class.bg-blue-600]="page === currentPage"
          [class.text-white]="page === currentPage"
          [class.bg-gray-200]="page !== currentPage"
          [class.text-gray-700]="page !== currentPage"
          class="px-3 py-2 rounded-lg hover:bg-blue-500 hover:text-white">
          {{page}}
        </button>
        
        <button 
          (click)="onPageChange(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </nav>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getVisiblePages(): number[] {
    const maxVisible = 7;
    const pages: number[] = [];
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}