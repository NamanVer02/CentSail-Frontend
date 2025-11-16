'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseAuthService } from '@/lib/services/firebaseAuthService';
import { SignupRequest, LoginRequest, FirebaseUser, AuthError } from '@/lib/types/auth';
import { authService } from '@/lib/services/authService';
import { cacheService } from '@/lib/services/cacheService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: FirebaseUser | null;
}

interface AuthActions {
  signIn: (data: LoginRequest) => Promise<boolean>;
  signUp: (data: SignupRequest) => Promise<boolean>;
  logout: () => Promise<boolean>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
  });

  const signIn = useCallback(async (data: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await firebaseAuthService.signIn(data.email, data.password);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user,
        error: null,
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during sign in';
        
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, []);

  const signUp = useCallback(async (data: SignupRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Create the user via backend API
      const signupResponse = await authService.signup({
        username: data.displayName ?? data.email.split('@')[0],
        email: data.email,
        password: data.password,
      });

      if (!signupResponse.success) {
        setState(prev => ({ ...prev, isLoading: false, error: signupResponse.message || 'Sign up failed' }));
        return false;
      }

      // Sign in the new user with Firebase to establish client session
      const user = await firebaseAuthService.signIn(data.email, data.password);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user,
        error: null,
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during sign up';
        
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await firebaseAuthService.signOut();
      
      // Clear all cache on logout to prevent data leakage
      cacheService.clear();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during logout';
        
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
      setState(prev => ({
        ...prev,
        isAuthenticated: !!user,
        user,
        isLoading: false,
      }));
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    logout,
    clearError,
  };
}
