import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDoc, collection, onSnapshot, query } from 'firebase/firestore';

// Safely load optional firebase config file without throwing UNRESOLVED_IMPORT if missing
const rawConfigFiles = typeof import.meta.glob === 'function'
  ? import.meta.glob<Record<string, any>>('/firebase-applet-config.json', { eager: true })
  : {};
const rawConfig = (rawConfigFiles['/firebase-applet-config.json'] as any)?.default || rawConfigFiles['/firebase-applet-config.json'] || {};

// Safely resolve configuration: prioritize Vite environment variables, fallback to Node or JSON config
const env: Record<string, any> = (typeof import.meta !== 'undefined' && (import.meta as any).env) 
  ? (import.meta as any).env 
  : (typeof process !== 'undefined' && process.env) 
    ? process.env 
    : {};

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || 'gen-lang-client-0995388664',
  appId: env.VITE_FIREBASE_APP_ID || rawConfig.appId || '',
  apiKey: env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || '',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || rawConfig.measurementId || '',
  oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || rawConfig.oAuthClientId || '',
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore with databaseId if provisioned (e.g. ai-studio-npvitphcremix-...)
const rawDbId = firebaseConfig.firestoreDatabaseId ? firebaseConfig.firestoreDatabaseId.trim() : '';
const resolvedDatabaseId = (rawDbId && rawDbId !== '(default)') ? rawDbId : undefined;

export const db = resolvedDatabaseId 
  ? getFirestore(app, resolvedDatabaseId)
  : getFirestore(app);

// Helper for user-friendly localized error messages
export function getFirebaseAuthErrorMessage(error: any): string {
  if (!error) return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  
  const code = (typeof error === 'string' ? error : error?.code || '').trim();
  switch (code) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại.';
    case 'auth/user-disabled':
      return 'Tài khoản này tạm thời đã bị vô hiệu hóa bởi quản trị viên.';
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc chọn Quên mật khẩu.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng cho một tài khoản khác. Vui lòng đăng nhập hoặc dùng email khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn hoặc đơn giản. Vui lòng đặt mật khẩu từ 6 ký tự trở lên.';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất xác thực.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn cửa sổ Popup Google. Vui lòng cho phép popup trong cài đặt trình duyệt hoặc đăng nhập bằng Email.';
    case 'auth/cancelled-popup-request':
      return 'Yêu cầu mở cửa sổ đăng nhập đã được hủy.';
    case 'auth/unauthorized-domain':
      return 'Tên miền chưa được cấp phép xác thực Firebase OAuth. Vui lòng sử dụng đăng nhập bằng Email.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này hiện chưa được kích hoạt trên hệ thống.';
    case 'auth/too-many-requests':
      return 'Bạn đã thực hiện thao tác thất bại quá nhiều lần. Vui lòng đợi ít phút trước khi thử lại.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng đến máy chủ xác thực. Vui lòng kiểm tra đường truyền Internet.';
    case 'auth/requires-recent-login':
      return 'Thao tác này yêu cầu bạn phải đăng nhập lại gần đây để xác nhận bảo mật.';
    case 'auth/quota-exceeded':
      return 'Máy chủ xác thực tạm thời quá tải hạn mức. Vui lòng thử lại sau ít phút.';
    case 'auth/user-token-expired':
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.';
    case 'auth/missing-password':
      return 'Vui lòng nhập mật khẩu tài khoản.';
    case 'auth/missing-email':
      return 'Vui lòng nhập địa chỉ email của bạn.';
    case 'auth/account-exists-with-different-credential':
      return 'Tài khoản với email này đã tồn tại với một phương thức đăng nhập khác.';
    case 'auth/credential-already-in-use':
      return 'Thông tin xác thực này đã được liên kết với một tài khoản người dùng khác.';
    default:
      if (typeof error?.message === 'string' && error.message.trim() && !error.message.includes('Firebase:')) {
        return error.message;
      }
      return 'Không thể kết nối máy chủ xác thực hoặc đã có lỗi phát sinh. Vui lòng kiểm tra mạng hoặc thử lại sau.';
  }
}

// Timeout utility to ensure asynchronous Firebase/Firestore operations never hang indefinitely
export function withTimeout<T>(promise: Promise<T>, ms = 3000, fallbackValue?: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      if (fallbackValue !== undefined) {
        resolve(fallbackValue);
      } else {
        reject(new Error(`Thao tác quá thời gian chờ (${ms}ms)`));
      }
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

// Safe Firestore Write: Never hangs the application even if network or Firestore has latency
export async function safeFirestoreSet(docRef: any, data: any, options: { merge?: boolean } = { merge: true }): Promise<boolean> {
  try {
    // Initiate write with 2.5s maximum wait for client acknowledgement
    await withTimeout(setDoc(docRef, data, options), 2500, undefined);
    return true;
  } catch (err) {
    console.warn('Firestore safe setDoc notice (background continuing):', err);
    // Background write attempt in case of network latency
    setDoc(docRef, data, options).catch((e) => console.warn('Background setDoc notice:', e));
    return false;
  }
}

// Safe Firestore Read: Fails fast with timeout to prevent freezing the UI
export async function safeFirestoreGet(docRef: any, ms = 2500): Promise<any | null> {
  try {
    const snap = await withTimeout(getDoc(docRef), ms);
    return snap;
  } catch (err) {
    console.warn('Firestore safe getDoc notice (timed out or offline):', err);
    return null;
  }
}

// Validate connection with short timeout so it never blocks or holds connections
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await withTimeout(getDocFromServer(doc(db, '_connection_test_', 'ping')), 2000);
    return true;
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.warn('Firestore connection check notice:', error?.message || error);
    }
    return false;
  }
}

// Run connectivity check silently on app boot in browser without blocking
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testFirestoreConnection().catch(() => {});
  }, 1000);
}

export { 
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
  getDoc,
  doc,
  collection,
  onSnapshot,
  query
};
export type { User };
