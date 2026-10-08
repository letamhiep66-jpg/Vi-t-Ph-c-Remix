import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsGuest, updateUserProfile } = useApp();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    error: authError,
    clearError,
    rememberMe,
    setRememberMe,
    isActionLoading
  } = useFirebaseAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [gender, setGender] = useState<'female' | 'male' | 'unisex'>('female');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localRememberMe, setLocalRememberMe] = useState<boolean>(rememberMe);

  // Sync initial rememberMe state
  useEffect(() => {
    setLocalRememberMe(rememberMe);
  }, [rememberMe]);

  // Close on Escape key press (luôn khả dụng, không bao giờ khóa phím)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset transient feedback messages when switching modes
  const switchMode = (newMode: 'signin' | 'signup' | 'forgot_password') => {
    setMode(newMode);
    setLocalError(null);
    setSuccessMessage(null);
    clearError();
  };

  const displayedError = localError || authError;

  if (!isOpen) return null;

  const handleRememberMeChange = (checked: boolean) => {
    setLocalRememberMe(checked);
    setRememberMe(checked).catch(() => {});
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setLocalError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại định dạng email.');
      return;
    }

    if (mode === 'forgot_password') {
      setIsSubmitting(true);
      const watchdog = setTimeout(() => {
        setIsSubmitting(false);
        setLocalError('Yêu cầu gửi email quá thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }, 8000);

      try {
        await sendPasswordReset(cleanEmail);
        setSuccessMessage(`Đã gửi liên kết đặt lại mật khẩu đến ${cleanEmail}. Vui lòng kiểm tra hộp thư (cả mục Spam/Thư rác nếu không thấy).`);
      } catch {
        // Error is set in FirebaseAuthContext
      } finally {
        clearTimeout(watchdog);
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setLocalError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    setIsSubmitting(true);
    const watchdog = setTimeout(() => {
      setIsSubmitting(false);
      setLocalError('Kết nối xác thực Firebase phản hồi chậm. Bạn có thể thử lại hoặc nhấn "Trải nghiệm nhanh với tư cách Khách" ở bên dưới.');
    }, 7000);

    try {
      if (mode === 'signup') {
        const cleanName = displayName.trim();
        if (!cleanName) {
          setLocalError('Vui lòng nhập họ và tên của bạn để khởi tạo hồ sơ.');
          setIsSubmitting(false);
          clearTimeout(watchdog);
          return;
        }

        const newUser = await signUpWithEmail(cleanEmail, password, cleanName, {
          gender,
          rememberMe: localRememberMe
        });

        updateUserProfile({ name: cleanName, gender });
        setSuccessMessage(`Đăng ký thành công! Chào mừng ${newUser.displayName || cleanName} đến với Nếp.`);
      } else {
        const loggedUser = await signInWithEmail(cleanEmail, password, {
          rememberMe: localRememberMe
        });

        updateUserProfile({ gender });
        setSuccessMessage(`Đăng nhập thành công! Chào mừng ${loggedUser.displayName || 'bạn'} trở lại.`);
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } catch {
      // Error handled and localized by FirebaseAuthContext
    } finally {
      clearTimeout(watchdog);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    clearError();
    setIsSubmitting(true);

    const watchdog = setTimeout(() => {
      setIsSubmitting(false);
      setLocalError('Cửa sổ đăng nhập Google quá thời gian phản hồi. Nếu popup bị chặn, bạn có thể đăng nhập bằng Email hoặc trải nghiệm chế độ Khách.');
    }, 12000);

    try {
      const googleUser = await signInWithGoogle({
        rememberMe: localRememberMe,
        gender
      });

      updateUserProfile({ gender });
      setSuccessMessage(`Đăng nhập Google thành công! Chào mừng ${googleUser.displayName || 'bạn'}.`);

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      // Error handled and localized by FirebaseAuthContext
    } finally {
      clearTimeout(watchdog);
      setIsSubmitting(false);
    }
  };

  const isWorking = isSubmitting || isActionLoading;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DFD4C4] text-[#2C241D] animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Nút đóng luôn hoạt động để người dùng không bao giờ bị kẹt */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-[#7B6858] hover:text-[#2C241D] hover:bg-[#EFE7DC] transition-colors cursor-pointer z-10"
          aria-label="Đóng cửa sổ"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9B2226] to-[#800E13] text-white shadow-lg shadow-[#9B2226]/20 mb-3">
            {mode === 'forgot_password' ? <KeyRound className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h2 className="font-heritage text-2xl font-bold text-[#2C241D]">
            {mode === 'signin' && 'Đăng Nhập Nếp'}
            {mode === 'signup' && 'Tạo Tài Khoản Mới'}
            {mode === 'forgot_password' && 'Khôi Phục Mật Khẩu'}
          </h2>
          <p className="mt-1 text-xs text-[#6C584C]">
            {mode === 'forgot_password'
              ? 'Nhập email để nhận liên kết đặt lại mật khẩu an toàn qua hòm thư'
              : 'Lưu giữ bộ sưu tập Lookbook và đồng bộ số đo vóc dáng cá nhân qua Firebase'}
          </p>
        </div>

        {/* Mode Tabs (only when not in forgot password mode) */}
        {mode !== 'forgot_password' ? (
          <div className="flex p-1 bg-[#EFE7DC] rounded-xl mb-4 border border-[#DFD4C4]">
            <button
              type="button"
              disabled={isWorking}
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#9B2226] shadow-xs'
                  : 'text-[#6C584C] hover:text-[#2C241D]'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#9B2226] shadow-xs'
                  : 'text-[#6C584C] hover:text-[#2C241D]'
              }`}
            >
              Đăng Ký
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              disabled={isWorking}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9B2226] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Đăng Nhập</span>
            </button>
          </div>
        )}

        {/* Gender Selection - Giúp gợi ý phom dáng chuẩn xác */}
        {mode !== 'forgot_password' && (
          <div className="mb-4 p-3 bg-[#FAF3EA] rounded-2xl border border-[#DFD4C4]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#4A3E35] uppercase tracking-wider">
                Giới tính của bạn:
              </span>
              <span className="text-[10px] text-[#800E13] font-medium">
                (Gợi ý chuẩn phom dáng & khăn mũ)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'female', label: 'Nữ', icon: '🌸' },
                { id: 'male', label: 'Nam', icon: '👑' },
                { id: 'unisex', label: 'Linh hoạt', icon: '✨' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  disabled={isWorking}
                  onClick={() => setGender(g.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === g.id
                      ? 'bg-[#800E13] text-white border-[#800E13] shadow-xs'
                      : 'bg-white text-[#5C4D3C] border-[#DFD4C4] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Localized Vietnamese Feedback Alert */}
        {displayedError && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed">{displayedError}</div>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              className="text-red-400 hover:text-red-700 p-0.5"
              aria-label="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Google One-Click Sign In (Only for login / signup) */}
        {mode !== 'forgot_password' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isWorking}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-[#DFD4C4] text-[#2C241D] text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isWorking ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#9B2226]" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Tiếp tục với Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DFD4C4]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#FAF6F0] text-[#7B6858]">hoặc qua Email</span>
              </div>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B6858]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="Ví dụ: Nguyễn Linh Chi"
                  required={mode === 'signup'}
                  disabled={isWorking}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DFD4C4] rounded-xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#9B2226]/30 focus:border-[#9B2226] disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B6858]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="tenban@email.com"
                required
                disabled={isWorking}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DFD4C4] rounded-xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#9B2226]/30 focus:border-[#9B2226] disabled:opacity-60"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#4A3E35]">
                  Mật Khẩu
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    className="text-[11px] text-[#9B2226] hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B6858]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder={mode === 'signup' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}
                  required
                  minLength={6}
                  disabled={isWorking}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DFD4C4] rounded-xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#9B2226]/30 focus:border-[#9B2226] disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7B6858] hover:text-[#2C241D] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Session Persistence / Remember Me Checkbox */}
          {mode !== 'forgot_password' && (
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localRememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  disabled={isWorking}
                  className="w-4 h-4 rounded border-[#DFD4C4] text-[#9B2226] focus:ring-[#9B2226]/30 cursor-pointer accent-[#9B2226]"
                />
                <span className="text-xs text-[#5C4D3C] font-medium">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <div className="inline-flex items-center gap-1 text-[11px] text-[#7B6858]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9B2226]" />
                <span>Bảo mật Firebase</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isWorking}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#9B2226] to-[#800E13] hover:from-[#BA2D32] hover:to-[#9B2226] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#9B2226]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isWorking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Đăng Nhập'}
                  {mode === 'signup' && 'Đăng Ký Tài Khoản'}
                  {mode === 'forgot_password' && 'Gửi Liên Kết Khôi Phục'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Guest Access fallback */}
        <div className="mt-4 pt-3.5 border-t border-[#DFD4C4]/80 text-center">
          <button
            type="button"
            disabled={isWorking}
            onClick={() => {
              loginAsGuest('Khách Quý Nếp', gender);
              onClose();
              if (onSuccess) onSuccess();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-[#DFD4C4] bg-white hover:bg-[#F5ECE0] text-[#7B6858] hover:text-[#2C241D] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <User className="w-3.5 h-3.5 text-[#800E13]" />
            <span>Trải nghiệm nhanh với tư cách Khách (Không cần tài khoản)</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-[11px] text-[#7B6858]">
          Bằng việc đăng nhập, bạn đồng ý với tiêu chuẩn bảo mật dữ liệu và tôn vinh di sản Cổ phục Việt của Nếp.
        </p>
      </div>
    </div>
  );
};
export default AuthModal;
