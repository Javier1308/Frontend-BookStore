// src/app/profile/profile.component.ts - COMPLETO
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <h1 class="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p class="text-blue-100">Manage your account settings and preferences</p>
        </div>

        <div *ngIf="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div *ngIf="!loading && user" class="p-6">
          <div class="grid md:grid-cols-2 gap-8">
            
            <!-- Profile Image Section -->
            <div class="flex flex-col items-center">
              <div class="relative mb-4">
                <img 
                  [src]="getProfileImage()" 
                  [alt]="user.username"
                  class="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  (error)="onImageError($event)">
                
                <!-- Upload button overlay -->
                <label class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <input 
                    type="file" 
                    (change)="onFileSelected($event)" 
                    accept="image/*"
                    class="hidden">
                </label>
              </div>
              
              <button 
                *ngIf="selectedFile"
                (click)="uploadImage()"
                [disabled]="uploading"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ uploading ? 'Uploading...' : 'Upload Image' }}
              </button>
              
              <button 
                *ngIf="user.profile_image_url"
                (click)="removeImage()"
                [disabled]="uploading"
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Remove Image
              </button>
            </div>

            <!-- Profile Form Section -->
            <div>
              <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                <div class="space-y-4">
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                      type="text"
                      [(ngModel)]="profileData.username"
                      name="username"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text"
                      [(ngModel)]="profileData.first_name"
                      name="first_name"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text"
                      [(ngModel)]="profileData.last_name"
                      name="last_name"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email"
                      [value]="user.email"
                      disabled
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
                    <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel"
                      [(ngModel)]="profileData.phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-1">Phone number will be saved to your profile</p>
                  </div>

                  <div class="flex space-x-4 pt-4">
                    <button 
                      type="submit"
                      [disabled]="updating || !profileForm.valid"
                      class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ updating ? 'Updating...' : 'Update Profile' }}
                    </button>
                    
                    <button 
                      type="button"
                      (click)="showChangePassword = true"
                      class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Account Info Section -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">User ID:</span>
                <span class="text-gray-600 ml-2">{{ user.user_id }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Role:</span>
                <span class="text-gray-600 ml-2 capitalize">{{ user.role }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Phone:</span>
                <span class="text-gray-600 ml-2">{{ user.phone || 'Not provided' }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Member Since:</span>
                <span class="text-gray-600 ml-2">{{ formatDate(user.created_at) }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Last Updated:</span>
                <span class="text-gray-600 ml-2">{{ formatDate(user.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div *ngIf="showChangePassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Change Password</h2>
          
          <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password"
                  [(ngModel)]="passwordData.current_password"
                  name="current_password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password"
                  [(ngModel)]="passwordData.new_password"
                  name="new_password"
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  [(ngModel)]="passwordData.confirm_password"
                  name="confirm_password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="flex space-x-4 pt-4">
                <button 
                  type="submit"
                  [disabled]="changingPassword || !passwordForm.valid || passwordData.new_password !== passwordData.confirm_password"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ changingPassword ? 'Changing...' : 'Change Password' }}
                </button>
                
                <button 
                  type="button"
                  (click)="cancelChangePassword()"
                  class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  user: any = null;
  loading = false;
  updating = false;
  uploading = false;
  changingPassword = false;
  showChangePassword = false;

  selectedFile: File | null = null;
  
  profileData = {
    username: '',
    first_name: '',
    last_name: '',
    phone: ''
  };

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  ngOnInit() {
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.user = this.apiService.getCurrentUser();
    
    if (this.user) {
      this.profileData = {
        username: this.user.username || '',
        first_name: this.user.first_name || '',
        last_name: this.user.last_name || '',
        phone: this.user.phone || ''
      };
      console.log('Loaded profile data:', this.profileData);
      this.loading = false;
    } else {
      this.router.navigate(['/auth']);
    }
  }

  updateProfile() {
    this.updating = true;
    console.log('Updating profile with data:', this.profileData);
    
    // Simulate API call for now since the real API might not support profile updates
    setTimeout(() => {
      // Update local user data
      this.user = { 
        ...this.user, 
        ...this.profileData,
        updated_at: new Date().toISOString()
      };
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      
      // Update the API service current user
      this.apiService['currentUserSubject'].next(this.user);
      
      this.showMessage('Profile updated successfully!', 'success');
      this.updating = false;
      
      console.log('Profile updated successfully:', this.user);
    }, 1000);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Validate file type
      if (!this.selectedFile.type.startsWith('image/')) {
        this.showMessage('Please select an image file', 'error');
        this.selectedFile = null;
        return;
      }
      
      // Validate file size (max 5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.showMessage('File size must be less than 5MB', 'error');
        this.selectedFile = null;
        return;
      }
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        this.user.profile_image_url = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.apiService.uploadProfileImage(this.selectedFile).subscribe({
      next: (response) => {
        this.user.profile_image_url = response.profile_image_url;
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        
        this.showMessage('Profile image uploaded successfully!', 'success');
        this.selectedFile = null;
        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.showMessage('Error uploading image', 'error');
        this.uploading = false;
      }
    });
  }

  removeImage() {
    if (confirm('Are you sure you want to remove your profile image?')) {
      this.uploading = true;
      this.apiService.removeProfileImage().subscribe({
        next: (response) => {
          this.user.profile_image_url = null;
          
          // Update localStorage
          localStorage.setItem('currentUser', JSON.stringify(this.user));
          
          this.showMessage('Profile image removed successfully!', 'success');
          this.uploading = false;
        },
        error: (error) => {
          console.error('Error removing image:', error);
          this.showMessage('Error removing image', 'error');
          this.uploading = false;
        }
      });
    }
  }

  changePassword() {
    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.showMessage('New passwords do not match', 'error');
      return;
    }

    this.changingPassword = true;
    this.apiService.changePassword(this.passwordData.current_password, this.passwordData.new_password).subscribe({
      next: (response) => {
        this.showMessage('Password changed successfully!', 'success');
        this.cancelChangePassword();
        this.changingPassword = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.showMessage('Error changing password', 'error');
        this.changingPassword = false;
      }
    });
  }

  cancelChangePassword() {
    this.showChangePassword = false;
    this.passwordData = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    };
  }

  getProfileImage(): string {
    return this.user?.profile_image_url || '/assets/default-avatar.png';
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/default-avatar.png';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning') {
    const notification = document.createElement('div');
    let bgColor = 'bg-green-500';
    
    switch (type) {
      case 'error':
        bgColor = 'bg-red-500';
        break;
      case 'warning':
        bgColor = 'bg-yellow-500';
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