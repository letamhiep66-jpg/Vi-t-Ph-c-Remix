import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  setDoc,
  doc,
  db,
  getFirebaseAuthErrorMessage,
  User
} from '../services/firebase';

export interface FirebaseAuthContextType {
  // Session & User State
  user: User | null;
  currentUser: User | null; // Compatibility alias
  isAuthenticated: boolean;
  isLoading: boolean;
  isActionLoading: boolean;

  // Session Persistence
  rememberMe: boolean;
  persistenceType: 'local' | 'session';
  setRememberMe: (remember: boolean) => Promise<void>;

  // Error Handling
  error: string | null;
  errorCode: string | null;
  clearError: () => void;
  formatErrorMessage: (error: any) => string;

  // Authentication Operations
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    options?: { gender?: 'female' | 'male' | 'unisex'; rememberMe?: boolean }
  ) => Promise<User>;

  signInWithEmail: (
    email: string,
    password: string,
    options?: { rememberMe?: boolean }
  ) => Promise<User>;

  signInWithGoogle: (
    options?: { rememberMe?: boolean; gender?: 'female' | 'male' | 'unisex' }
  ) => Promise<User>;

  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfileInfo: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

const REMEMBER_ME_STORAGE_KEY = 'nep_auth_remember_me_v1';

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Persistence State: Default to true (remember across browser restarts)
  const [rememberMe, setRememberMeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // Localized Error State
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const formatErrorMessage = useCallback((err: any): string => {
    return getFirebaseAuthErrorMessage(err);
  }, []);

  // Configure Firebase persistence based on rememberMe preference (with safety timeout)
  const applyPersistence = useCallback(async (shouldRemember: boolean) => {
    try {
      const targetPersistence = shouldRemember ? browserLocalPersistence : browserSessionPersistence;
      await Promise.race([
        setPersistence(auth, targetPersistence),
        new Promise((res) => setTimeout(res, 600))
      ]);
    } catch (err) {
      console.warn('Cannot configure Firebase Auth persistence:', err);
    }
  }, []);

  // Update rememberMe state and reapply persistence
  const setRememberMe = useCallback(async (remember: boolean) => {
    setRememberMeState(remember);
    try {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, String(remember));
    } catch {
      // Ignore storage errors in restrictive environments
    }
    await applyPersistence(remember);
  }, [applyPersistence]);

  // Initial setup: configure persistence and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    // Apply saved persistence on start
    applyPersistence(rememberMe).catch(() => {});

    // Subscribe to Firebase Auth session
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyPersistence, rememberMe]);

  /**
   * Đăng ký tài khoản mới bằng Email và Mật khẩu (hoàn toàn không bị chặn bởi Firestore)
   */
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    options?: { gender?: 'female' | 'male' | 'unisex'; rememberMe?: boolean }
  ): Promise<User> => {
    clearError();
    setIsActionLoading(true);

    try {
      const shouldRemember = options?.rememberMe !== undefined ? options.rememberMe : rememberMe;
      await applyPersistence(shouldRemember);

      const cleanEmail = email.trim();
      const cleanName = displayName.trim();

      // 1. Create account with Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser = cred.user;

      // 2. Set display name directly in Firebase Auth (chạy nền, không chờ)
      if (cleanName) {
        updateProfile(newUser, { displayName: cleanName }).catch((profileErr) => {
          console.warn('Update display name warning:', profileErr);
        });
      }

      // 3. Persist initial user profile document in Firestore (chạy nền bất đồng bộ, không bao giờ làm treo giao diện)
      setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        name: cleanName || newUser.displayName || 'Khách Quý Nếp',
        email: cleanEmail,
        gender: options?.gender || 'female',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((firestoreErr) => {
        console.warn('Firestore initial user sync notice (background):', firestoreErr);
      });

      setUser(newUser);
      return newUser;
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [applyPersistence, clearError, rememberMe]);

  /**
   * Đăng nhập bằng Email và Mật khẩu
   */
  const signInWithEmail = useCallback(async (
    email: string,
    password: string,
    options?: { rememberMe?: boolean }
  ): Promise<User> => {
    clearError();
    setIsActionLoading(true);

    try {
      const shouldRemember = options?.rememberMe !== undefined ? options.rememberMe : rememberMe;
      await applyPersistence(shouldRemember);

      const cleanEmail = email.trim();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setUser(cred.user);
      return cred.user;
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [applyPersistence, clearError, rememberMe]);

  /**
   * Đăng nhập nhanh bằng tài khoản Google (OAuth Popup)
   */
  const signInWithGoogle = useCallback(async (
    options?: { rememberMe?: boolean; gender?: 'female' | 'male' | 'unisex' }
  ): Promise<User> => {
    clearError();
    setIsActionLoading(true);

    try {
      const shouldRemember = options?.rememberMe !== undefined ? options.rememberMe : rememberMe;
      await applyPersistence(shouldRemember);

      const res = await signInWithPopup(auth, googleProvider);
      const googleUser = res.user;

      // Đồng bộ thông tin người dùng vào Firestore chạy nền (không block luồng đăng nhập)
      setDoc(doc(db, 'users', googleUser.uid), {
        uid: googleUser.uid,
        name: googleUser.displayName || 'Khách Quý Nếp',
        email: googleUser.email || '',
        avatar: googleUser.photoURL || '',
        gender: options?.gender || 'female',
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((firestoreErr) => {
        console.warn('Firestore Google sign-in sync notice (background):', firestoreErr);
      });

      setUser(googleUser);
      return googleUser;
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [applyPersistence, clearError, rememberMe]);

  /**
   * Đăng xuất khỏi hệ thống
   */
  const signOut = useCallback(async (): Promise<void> => {
    clearError();
    setIsActionLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [clearError]);

  /**
   * Gửi email khôi phục / đặt lại mật khẩu
   */
  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    clearError();
    setIsActionLoading(true);

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        throw { code: 'auth/missing-email' };
      }
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [clearError]);

  /**
   * Cập nhật thông tin hồ sơ người dùng trên Firebase Auth
   */
  const updateProfileInfo = useCallback(async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    if (!auth.currentUser) return;
    clearError();
    setIsActionLoading(true);

    try {
      await updateProfile(auth.currentUser, updates);
      setUser({ ...auth.currentUser } as User);
    } catch (err: any) {
      const code = err?.code || 'auth/unknown-error';
      const msg = getFirebaseAuthErrorMessage(err);
      setErrorCode(code);
      setError(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }, [clearError]);

  const value: FirebaseAuthContextType = useMemo(() => ({
    user,
    currentUser: user,
    isAuthenticated: Boolean(user),
    isLoading,
    isActionLoading,
    rememberMe,
    persistenceType: rememberMe ? 'local' : 'session',
    setRememberMe,
    error,
    errorCode,
    clearError,
    formatErrorMessage,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updateProfileInfo,
  }), [
    user,
    isLoading,
    isActionLoading,
    rememberMe,
    setRememberMe,
    error,
    errorCode,
    clearError,
    formatErrorMessage,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updateProfileInfo
  ]);

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

/**
 * Custom hook to consume Firebase Authentication context
 */
export const useFirebaseAuth = (): FirebaseAuthContextType => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a <FirebaseAuthProvider>');
  }
  return context;
};

// Convenient alias
export const useAuth = useFirebaseAuth;
