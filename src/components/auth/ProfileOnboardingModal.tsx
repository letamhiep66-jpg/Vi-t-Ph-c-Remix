import React, { useState, useEffect } from 'react';
import { 
  X,
  Ruler, 
  Scale, 
  User, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Heart,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeBodyProfile } from '../../utils/bodyProfile';
import { Gender } from '../../types';

const ERA_OPTIONS = [
  {
    id: 'nguyen',
    label: 'Triều Nguyễn',
    period: '1802 - 1945',
    highlight: 'Áo Tấc, Nhật Bình, Ngũ Thân',
    icon: '👑'
  },
  {
    id: 'le',
    label: 'Triều Lê Sơ',
    period: '1428 - 1527',
    highlight: 'Áo Giao Lĩnh, Bổ Phục, Viên Lĩnh',
    icon: '⚜️'
  },
  {
    id: 'modern',
    label: 'Áo Dài Tân Thời',
    period: '1930 - Nay',
    highlight: 'Áo Dài Le Mur, Cách Tân',
    icon: '🌸'
  },
  {
    id: 'remix',
    label: 'Phong Cách Remix',
    period: 'Đương Đại',
    highlight: 'Giao thoa cổ phục & thời trang hiện đại',
    icon: '✨'
  }
];

const PURPOSE_OPTIONS = [
  { id: 'mix_photo', label: 'Thử phối đồ & ngắm cổ phục 2D', icon: '📸', desc: 'Trải nghiệm nhiều lớp phục sức trên mannequin' },
  { id: 'tailoring', label: 'Chuẩn bị số đo may đo tiệm', icon: '🪡', desc: 'Lấy thông số chuẩn điển chế để đặt may tiệm' },
  { id: 'history', label: 'Khảo cứu lịch sử & di sản văn hóa', icon: '🏛️', desc: 'Tìm hiểu quy cách điển chế và ý nghĩa hoa văn' }
];

const QUICK_AGES = [18, 22, 25, 28, 32, 40, 50];

export const ProfileOnboardingModal: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    isOnboardingModalOpen, 
    completeOnboarding,
    skipOnboarding
  } = useApp();

  // Handle Escape key to dismiss modal cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOnboardingModalOpen) {
        skipOnboarding();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingModalOpen, skipOnboarding]);

  // Mandatory Body Stats (Bước 1)
  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || 'Khách Quý Nếp');
  const [age, setAge] = useState<number>(userProfile?.age || 24);
  const [height, setHeight] = useState<number>(userProfile?.height || 165);
  const [weight, setWeight] = useState<number>(userProfile?.weight || 55);
  const [gender, setGender] = useState<Gender>(userProfile?.gender || 'female');

  // Multi-select Heritage Preferences (Bước 2 - Tùy chọn, có thể chọn nhiều hoặc bỏ qua)
  const [favoriteEras, setFavoriteEras] = useState<string[]>(() => {
    if (userProfile?.favoriteEras && userProfile.favoriteEras.length > 0) {
      return userProfile.favoriteEras;
    }
    if (userProfile?.favoriteEra) {
      return [userProfile.favoriteEra];
    }
    return ['nguyen'];
  });

  const [purposes, setPurposes] = useState<string[]>(() => {
    if (userProfile?.purposes && userProfile.purposes.length > 0) {
      return userProfile.purposes;
    }
    if (userProfile?.purpose) {
      return [userProfile.purpose];
    }
    return ['mix_photo'];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial values when modal opens or user profile loads
  useEffect(() => {
    if (isOnboardingModalOpen) {
      setName(userProfile?.name || currentUser?.displayName || 'Khách Quý Nếp');
      setAge(userProfile?.age || 24);
      setHeight(userProfile?.height || 165);
      setWeight(userProfile?.weight || 55);
      setGender(userProfile?.gender || 'female');

      if (userProfile?.favoriteEras && userProfile.favoriteEras.length > 0) {
        setFavoriteEras(userProfile.favoriteEras);
      } else if (userProfile?.favoriteEra) {
        setFavoriteEras([userProfile.favoriteEra]);
      }

      if (userProfile?.purposes && userProfile.purposes.length > 0) {
        setPurposes(userProfile.purposes);
      } else if (userProfile?.purpose) {
        setPurposes([userProfile.purpose]);
      }
    }
  }, [isOnboardingModalOpen, currentUser, userProfile]);

  if (!isOnboardingModalOpen) return null;

  // Real-time body analysis based on inputs
  const bodyAnalysis = analyzeBodyProfile({
    name: name.trim() || 'Bạn',
    age,
    height,
    weight,
    gender,
    avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  });

  // Toggle multi-select for Era
  const toggleEra = (eraId: string) => {
    setFavoriteEras((prev) => 
      prev.includes(eraId) ? prev.filter((id) => id !== eraId) : [...prev, eraId]
    );
  };

  // Toggle multi-select for Purpose
  const togglePurpose = (purposeId: string) => {
    setPurposes((prev) => 
      prev.includes(purposeId) ? prev.filter((id) => id !== purposeId) : [...prev, purposeId]
    );
  };

  // Select all or clear eras
  const toggleAllEras = () => {
    if (favoriteEras.length === ERA_OPTIONS.length) {
      setFavoriteEras([]);
    } else {
      setFavoriteEras(ERA_OPTIONS.map((e) => e.id));
    }
  };

  // Validate step 1 body stats (Mandatory)
  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      setValidationError('Vui lòng nhập họ tên hoặc danh xưng hiển thị.');
      return false;
    }
    if (height < 140 || height > 210) {
      setValidationError('Chiều cao vui lòng nằm trong khoảng từ 140cm đến 210cm.');
      return false;
    }
    if (weight < 30 || weight > 150) {
      setValidationError('Cân nặng vui lòng nằm trong khoảng từ 30kg đến 150kg.');
      return false;
    }
    if (age < 15 || age > 100) {
      setValidationError('Độ tuổi vui lòng từ 15 tuổi trở lên.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Submit handler (can save from Step 1 directly if skipping Step 2, or from Step 2)
  const handleFinalSubmit = async (skipPreferences: boolean = false) => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    const selectedEras = skipPreferences ? ['nguyen'] : (favoriteEras.length > 0 ? favoriteEras : ['nguyen']);
    const selectedPurposes = skipPreferences ? ['mix_photo'] : (purposes.length > 0 ? purposes : ['mix_photo']);

    try {
      await completeOnboarding({
        name: name.trim(),
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender,
        favoriteEra: selectedEras[0],
        favoriteEras: selectedEras,
        purpose: selectedPurposes[0],
        purposes: selectedPurposes,
        isOnboarded: true
      });
    } catch (err) {
      console.warn('Error completing onboarding:', err);
    } finally {
      setIsSubmitting(false);
      skipOnboarding(); // Đảm bảo đóng cửa sổ ngay cả khi có bất kỳ sự cố mạng nào
    }
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          skipOnboarding();
        }
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#DFD4C4] text-[#2C241D] my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Nút đóng / Để sau góc trên bên phải */}
        <button
          type="button"
          onClick={skipOnboarding}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7B6858] hover:text-[#2C241D] hover:bg-[#EFE7DC] transition-colors cursor-pointer z-10"
          aria-label="Đóng và để sau"
          title="Để sau / Đóng và vào ứng dụng ngay"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800E13]/10 border border-[#800E13]/20 text-[#800E13] text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chào mừng bạn đến với Nếp · May Đo & Di Sản</span>
          </div>
          <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-[#2C241D]">
            Thiết Lập Hồ Sơ May Đo & Vóc Dáng
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6C584C] max-w-lg mx-auto leading-relaxed">
            {currentStep === 1 
              ? 'Bước 1 là bắt buộc: Cung cấp thông số cơ bản để Nếp tính tỷ lệ vạt áo, định chuẩn size may đo và gợi ý kiểu cổ phục phù hợp nhất.'
              : 'Bước 2 là tùy chọn: Bạn có thể chọn nhiều triều đại & mục đích quan tâm, hoặc có thể bỏ qua để vào ngay màn hình chính.'}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-[#800E13] text-white shadow-xs'
                  : 'bg-[#EFE7DC] text-[#7B6858] hover:bg-[#E5DBCF]'
              }`}
            >
              <span>1. Thông số vóc dáng</span>
              <span className="text-[10px] uppercase font-bold tracking-tight bg-white/20 px-1.5 py-0.2 rounded">Bắt buộc</span>
            </button>
            <div className="w-6 h-px bg-[#DFD4C4]" />
            <button
              type="button"
              onClick={handleNextStep}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-[#800E13] text-white shadow-xs'
                  : 'bg-[#EFE7DC] text-[#7B6858] hover:bg-[#E5DBCF]'
              }`}
            >
              <span>2. Sở thích di sản</span>
              <span className="text-[10px] text-[#7B6858] bg-stone-200 px-1.5 py-0.2 rounded font-normal">Tùy chọn</span>
            </button>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span>{validationError}</span>
            <button 
              type="button" 
              onClick={() => setValidationError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-bold ml-2"
            >
              Đóng
            </button>
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="space-y-6">
          {/* STEP 1: Body Metrics (MANDATORY) */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#800E13]" />
                  <span>Bước điền thông số là bắt buộc để hệ thống tính toán size áo và may đo chuẩn xác.</span>
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Họ và Tên hoặc Danh xưng hiển thị <span className="text-[#800E13] font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B6858]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Ví dụ: Nguyễn Linh Chi"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFD4C4] rounded-xl text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13] transition-all"
                  />
                </div>
              </div>

              {/* Gender / Character Silhouette */}
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Phom dáng nhân vật & May đo <span className="text-[#800E13] font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      gender === 'female'
                        ? 'border-[#800E13] bg-[#800E13]/10 text-[#800E13] font-bold shadow-xs'
                        : 'border-[#DFD4C4] bg-white text-[#4A3E35] hover:bg-[#F5ECE0]'
                    }`}
                  >
                    <span className="text-xl">👩</span>
                    <span className="text-xs">Nữ giới</span>
                    <span className="text-[10px] text-[#7B6858]">Dáng áo chiết eo, thướt tha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      gender === 'male'
                        ? 'border-[#800E13] bg-[#800E13]/10 text-[#800E13] font-bold shadow-xs'
                        : 'border-[#DFD4C4] bg-white text-[#4A3E35] hover:bg-[#F5ECE0]'
                    }`}
                  >
                    <span className="text-xl">👨</span>
                    <span className="text-xs">Nam giới</span>
                    <span className="text-[10px] text-[#7B6858]">Dáng đứng đĩnh đạc, lập lĩnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('unisex')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      gender === 'unisex'
                        ? 'border-[#800E13] bg-[#800E13]/10 text-[#800E13] font-bold shadow-xs'
                        : 'border-[#DFD4C4] bg-white text-[#4A3E35] hover:bg-[#F5ECE0]'
                    }`}
                  >
                    <span className="text-xl">✨</span>
                    <span className="text-xs">Linh hoạt</span>
                    <span className="text-[10px] text-[#7B6858]">Phối đa phong cách tự do</span>
                  </button>
                </div>
              </div>

              {/* Age Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#4A3E35] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7B6858]" />
                    <span>Tuổi của bạn:</span> <span className="text-[#800E13]">*</span>
                  </label>
                  <span className="text-xs font-bold text-[#800E13] bg-[#800E13]/10 px-2 py-0.5 rounded-md">
                    {age} tuổi
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="15"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="flex-1 accent-[#800E13] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="15"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Math.max(15, Math.min(100, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-center bg-white border border-[#DFD4C4] rounded-lg text-xs font-semibold text-[#2C241D]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_AGES.map((qAge) => (
                    <button
                      key={qAge}
                      type="button"
                      onClick={() => setAge(qAge)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                        age === qAge
                          ? 'bg-[#800E13] text-white border-[#800E13]'
                          : 'bg-white text-[#6C584C] border-[#DFD4C4] hover:bg-[#F5ECE0]'
                      }`}
                    >
                      {qAge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height & Weight Dual Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Height */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#DFD4C4]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#4A3E35] flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#800E13]" />
                      <span>Chiều cao</span> <span className="text-[#800E13]">*</span>
                    </label>
                    <span className="text-xs font-bold text-[#800E13] bg-[#800E13]/10 px-2 py-0.5 rounded-md">
                      {height} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="205"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-[#800E13] cursor-pointer mb-2"
                  />
                  <div className="flex justify-between text-[10px] text-[#7B6858]">
                    <span>140 cm</span>
                    <span>170 cm</span>
                    <span>205 cm</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#DFD4C4]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#4A3E35] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#800E13]" />
                      <span>Cân nặng</span> <span className="text-[#800E13]">*</span>
                    </label>
                    <span className="text-xs font-bold text-[#800E13] bg-[#800E13]/10 px-2 py-0.5 rounded-md">
                      {weight} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="120"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-[#800E13] cursor-pointer mb-2"
                  />
                  <div className="flex justify-between text-[10px] text-[#7B6858]">
                    <span>35 kg</span>
                    <span>60 kg</span>
                    <span>120 kg</span>
                  </div>
                </div>
              </div>

              {/* Real-time Body Profile Preview Card */}
              <div className="p-3.5 bg-gradient-to-br from-[#F5ECE0] to-[#EFE4D6] rounded-2xl border border-[#DFD1BD] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#800E13] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Heart className="w-5 h-5 text-rose-200 fill-rose-200/40" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C241D]">
                      Tỷ lệ thể trạng: {bodyAnalysis.bmiCategory} (BMI {bodyAnalysis.bmi})
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#800E13] text-white">
                      Size may đo gợi ý: {bodyAnalysis.recommendedSize}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C584C] leading-relaxed">
                    {bodyAnalysis.tailoringNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Era and Style Preferences (MULTI-SELECT & SKIPPABLE) */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6F0] rounded-xl border border-[#DFD4C4] text-[11px] text-[#7B6858]">
                <span>Phần này là tùy chọn: Bạn có thể chọn nhiều triều đại hoặc bỏ qua.</span>
                <button
                  type="button"
                  onClick={toggleAllEras}
                  className="text-xs font-semibold text-[#800E13] hover:underline cursor-pointer"
                >
                  {favoriteEras.length === ERA_OPTIONS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả triều đại'}
                </button>
              </div>

              {/* Multi-Select Favorite Eras */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#4A3E35]">
                    Triều đại & Dòng cổ phục bạn yêu thích (Chọn một hoặc nhiều)
                  </label>
                  <span className="text-[11px] font-semibold text-[#800E13]">
                    Đã chọn: {favoriteEras.length}/{ERA_OPTIONS.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ERA_OPTIONS.map((opt) => {
                    const isSelected = favoriteEras.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleEra(opt.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? 'border-[#800E13] bg-[#800E13]/10 ring-1.5 ring-[#800E13]'
                            : 'border-[#DFD4C4] bg-white hover:bg-[#F5ECE0]'
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2C241D]">{opt.label}</span>
                            <span className="text-[10px] text-[#7B6858] font-medium">{opt.period}</span>
                          </div>
                          <p className="text-[11px] text-[#6C584C] mt-0.5 truncate">{opt.highlight}</p>
                        </div>
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-[#800E13] border-[#800E13] text-white' 
                            : 'border-[#DFD4C4] bg-stone-50'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Select Purpose */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#4A3E35]">
                    Mục đích chính khi sử dụng ứng dụng (Chọn một hoặc nhiều)
                  </label>
                  <span className="text-[11px] font-semibold text-[#800E13]">
                    Đã chọn: {purposes.length}/{PURPOSE_OPTIONS.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {PURPOSE_OPTIONS.map((pur) => {
                    const isSelected = purposes.includes(pur.id);
                    return (
                      <button
                        key={pur.id}
                        type="button"
                        onClick={() => togglePurpose(pur.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#800E13] bg-[#800E13]/10 font-medium text-[#800E13]'
                            : 'border-[#DFD4C4] bg-white text-[#4A3E35] hover:bg-[#F5ECE0]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="text-lg">{pur.icon}</span>
                          <div>
                            <span className="font-semibold block">{pur.label}</span>
                            <span className="text-[10px] text-[#7B6858]">{pur.desc}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-[#800E13] border-[#800E13] text-white' 
                            : 'border-[#DFD4C4] bg-stone-50'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Summary */}
              <div className="p-4 bg-white rounded-2xl border border-[#DFD4C4] text-xs space-y-2">
                <span className="font-bold text-[#800E13] block">Gợi ý trang phục khởi đầu dành cho bạn:</span>
                <div className="flex flex-wrap gap-2">
                  {bodyAnalysis.costumeRecommendations.map((rec, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD1BD] text-[#2C241D] font-medium text-[11px] flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#800E13]" />
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#DFD4C4]">
            {/* Step 1 actions */}
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={skipOnboarding}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs text-[#7B6858] hover:text-[#2C241D] font-medium transition-colors text-center cursor-pointer"
                  title="Để sau và vào thẳng màn hình chính"
                >
                  Để sau & Vào thẳng màn hình chính
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(true)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#DFD4C4] bg-white hover:bg-[#F5ECE0] text-[#4A3E35] text-xs font-semibold transition-all cursor-pointer"
                    title="Lưu thông số cơ bản và vào ngay màn hình chính"
                  >
                    Lưu & Khám phá ngay
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2226] to-[#800E13] hover:from-[#BA2D32] hover:to-[#9B2226] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#800E13]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục: Chọn Sở Thích</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Step 2 actions */
              <>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#DFD4C4] bg-white hover:bg-[#F5ECE0] text-[#4A3E35] text-xs font-semibold transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={skipOnboarding}
                    className="px-3.5 py-2.5 text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold transition-colors cursor-pointer"
                  >
                    Để sau / Bỏ qua
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B2226] to-[#800E13] hover:from-[#BA2D32] hover:to-[#9B2226] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#800E13]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Lưu Sở Thích & Vào Màn Hình Chính</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
