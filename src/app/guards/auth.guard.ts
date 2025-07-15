// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token) {
    return true;
  } else {
    router.navigate(['/auth']);
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};