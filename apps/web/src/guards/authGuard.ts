import { useAuthStore } from '../stores/authStore';
import { redirect } from '@tanstack/react-router';

export const authGuard = async () => {
  const { isAuthenticated, refreshUser } = useAuthStore.getState();
  
  if (!isAuthenticated) {
    await refreshUser();
    const { isAuthenticated: checked } = useAuthStore.getState();
    if (!checked) {
      throw redirect({ to: '/auth/login', search: { redirect: window.location.pathname } });
    }
  }
};

export const guestGuard = async () => {
  const { isAuthenticated, refreshUser } = useAuthStore.getState();
  
  if (isAuthenticated) {
    await refreshUser();
    const { isAuthenticated: checked } = useAuthStore.getState();
    if (checked) {
      throw redirect({ to: '/calculator' });
    }
  }
};