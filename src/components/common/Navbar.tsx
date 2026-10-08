import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NepLavisLogo } from './NepLavisLogo';
import { 
  Compass, 
  Sparkles, 
  SlidersHorizontal, 
  MessageSquare, 
  Award, 
  History, 
  User,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    userProfile, 
    openChatWithContext, 
    lookbookHistory,
    currentUser,
    openAuthModal,
    openOnboardingModal,
    logout
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#E9DFD1] transition-all w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* 3-Zone Flex Container: Left (Logo), Center (Pills on md+), Right (AI & Profile) */}
        <div className="flex items-center justify-between h-14 md:h-16 lg:h-18">
          {/* ========================================================
              LEFT ZONE: Single Brand Logo (Anchored to the left)
              ======================================================== */}
          <div className="flex items-center shrink-0">
            {/* Exactly ONE logo on mobile (< 768px: size="sm") */}
            <div className="flex md:hidden">
              <NepLavisLogo
                size="sm"
                onClick={() => setActiveTab('explore')}
                className="cursor-pointer"
              />
            </div>
            {/* Exactly ONE logo on desktop & tablet (>= 768px: size="md") */}
            <div className="hidden md:flex">
              <NepLavisLogo
                size="md"
                onClick={() => setActiveTab('explore')}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* ========================================================
              CENTER ZONE: Navigation Pill Bar (Tablet & Desktop md:flex)
              Reduced padding and text-xs on Tablet (md) to avoid wrapping
              ======================================================== */}
          <nav 
            aria-label="Thanh điều hướng chính"
            className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 bg-[#F2ECE3] rounded-2xl border border-[#DFD1BD]"
          >
            {/* 1. Khám phá */}
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-[#800E13] text-white shadow-sm shadow-[#800E13]/25'
                  : 'text-[#4A3E35] hover:bg-[#EFE7DC] hover:text-[#2C241D]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Khám phá</span>
            </button>

            {/* 2. Phối đồ */}
            <button
              onClick={() => setActiveTab('mix')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'mix'
                  ? 'bg-[#800E13] text-white shadow-sm shadow-[#800E13]/25'
                  : 'text-[#4A3E35] hover:bg-[#EFE7DC] hover:text-[#2C241D]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Phối đồ</span>
            </button>


            {/* 4. Chấm điểm */}
            <button
              onClick={() => setActiveTab('critique')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'critique'
                  ? 'bg-[#800E13] text-white shadow-sm shadow-[#800E13]/25'
                  : 'text-[#4A3E35] hover:bg-[#EFE7DC] hover:text-[#2C241D]'
              }`}
            >
              <Award className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Chấm điểm</span>
            </button>

            {/* 5. Lịch sử */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'history'
                  ? 'bg-[#800E13] text-white shadow-sm shadow-[#800E13]/25'
                  : 'text-[#4A3E35] hover:bg-[#EFE7DC] hover:text-[#2C241D]'
              }`}
            >
              <History className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Lịch sử</span>
              {lookbookHistory.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-all ${
                    activeTab === 'history'
                      ? 'bg-white text-[#800E13]'
                      : 'bg-[#800E13] text-white'
                  }`}
                >
                  {lookbookHistory.length}
                </span>
              )}
            </button>

            {/* 6. Cài đặt */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#800E13] text-white shadow-sm shadow-[#800E13]/25'
                  : 'text-[#4A3E35] hover:bg-[#EFE7DC] hover:text-[#2C241D]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Cài đặt</span>
            </button>
          </nav>

          {/* ========================================================
              RIGHT ZONE: AI Assistant Quick Action & User Profile Capsule / Login
              ======================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={() => openChatWithContext()}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-[#800E13]/10 hover:bg-[#800E13] text-[#800E13] hover:text-white rounded-xl text-xs font-semibold border border-[#800E13]/20 transition-all shadow-xs active:scale-95"
              title="Mở Trợ Lý Cổ Phục AI"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] sm:text-xs font-medium">Trợ lý AI</span>
            </button>

            {/* Authenticated User Menu or Guest Login Button */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 p-1 rounded-full border border-[#DFD1BD] bg-[#F5ECE0] hover:bg-[#EFE4D6] transition-all cursor-pointer focus:outline-none ${
                    isUserMenuOpen ? 'ring-2 ring-[#800E13]' : ''
                  }`}
                  title="Tài khoản cá nhân"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt={userProfile?.name || 'Người dùng'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-[#800E13]" />
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#7B6858] mr-1 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E9DFD1] py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#F0E6D8]">
                      <p className="text-xs font-bold text-[#2C241D] truncate">
                        {userProfile?.name || currentUser.displayName || 'Khách Quý Nếp'}
                      </p>
                      <p className="text-[11px] text-[#7B6858] truncate">
                        {currentUser.email}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#800E13] font-semibold bg-[#800E13]/10 px-2 py-0.5 rounded-md">
                        <span>{userProfile?.height || 165} cm</span>
                        <span>•</span>
                        <span>{userProfile?.weight || 55} kg</span>
                        <span>•</span>
                        <span>{userProfile?.gender === 'female' ? 'Nữ' : userProfile?.gender === 'male' ? 'Nam' : 'Linh hoạt'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openOnboardingModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4A3E35] hover:bg-[#FAF6F0] hover:text-[#9B2226] flex items-center gap-2 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-[#800E13]" />
                        <span>Chỉnh nhanh số đo may đo</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4A3E35] hover:bg-[#FAF6F0] hover:text-[#9B2226] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Cài đặt chi tiết hồ sơ</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('history');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#4A3E35] hover:bg-[#FAF6F0] hover:text-[#9B2226] flex items-center gap-2"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Lookbook đã lưu ({lookbookHistory.length})</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#F0E6D8]">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-[#9B2226] to-[#800E13] hover:from-[#BA2D32] hover:to-[#9B2226] text-white text-xs font-semibold rounded-xl shadow-xs shadow-[#9B2226]/20 transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
