/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { Loading } from './components/common/Loading';
import { ErrorModal } from './components/common/ErrorModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Core main tabs are eagerly loaded for instant navigation and rock-solid hook lifecycle
import { ExploreSection } from './components/explore/ExploreSection';
import { MixSection } from './components/mix/MixSection';

// Background patterns
import { ExploreHeritageBackground } from './components/backgrounds/ExploreHeritageBackground';
import { MixHeritageBackground } from './components/backgrounds/MixHeritageBackground';
import { SettingsHeritageBackground } from './components/backgrounds/SettingsHeritageBackground';

import { OutfitCritiqueSection } from './components/critique/OutfitCritiqueSection';

// Lazy-loaded secondary feature tabs to reduce initial JavaScript bundle
const SettingsSection = React.lazy(() =>
  import('./components/settings/SettingsSection').then((m) => ({
    default: m.SettingsSection,
  }))
);
const HistorySection = React.lazy(() =>
  import('./components/history/HistorySection').then((m) => ({
    default: m.HistorySection,
  }))
);
const HeritageAdvisorChatbot = React.lazy(() =>
  import('./components/chat/HeritageAdvisorChatbot').then((m) => ({
    default: m.HeritageAdvisorChatbot,
  }))
);
const AuthModal = React.lazy(() =>
  import('./components/auth/AuthModal').then((m) => ({
    default: m.AuthModal,
  }))
);
const ProfileOnboardingModal = React.lazy(() =>
  import('./components/auth/ProfileOnboardingModal').then((m) => ({
    default: m.ProfileOnboardingModal,
  }))
);

/**
 * Giao diện Loading tối giản cao cấp (Luxury Minimalist Heritage Progress):
 * - Thanh tiến trình thanh lịch với dải ánh kim shimmer nhẹ
 * - Biểu tượng ấn triện hoa sen / cổ phục thanh tao
 * - Kiểu chữ chuẩn mực 'Be Vietnam Pro', hiển thị dấu tiếng Việt sắc nét không lỗi
 */
const SectionLoadingFallback: React.FC<{ 
  title?: string; 
  subtitle?: string; 
}> = ({
  title = 'Đang khởi tạo không gian di sản...',
  subtitle = 'Chuẩn bị dữ liệu phục sức và hệ thống hoa văn truyền thống',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] py-16 px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-2xl border border-[#E7DAC8] shadow-sm p-6 sm:p-7 flex flex-col items-center text-center">
        {/* Crest Motif */}
        <div className="relative w-12 h-12 mb-3.5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#800E13]/5 animate-soft-pulse" />
          <div className="w-10 h-10 rounded-full border border-[#DFD1BD] bg-[#FAF6F0] flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-5 h-5 text-[#800E13]" fill="currentColor">
              <path d="M16 4C16 8 13.5 11 11 14C13 14 15 13 16 11C17 13 19 14 21 14C18.5 11 16 4 16 4Z" opacity="0.9" />
              <path d="M11 14C8 14 5 17 6 21C9 21 12 18 13 16C12.2 15.3 11.5 14.7 11 14Z" opacity="0.75" />
              <path d="M21 14C24 14 27 17 26 21C23 21 20 18 19 16C19.8 15.3 20.5 14.7 21 14Z" opacity="0.75" />
              <circle cx="16" cy="19" r="1.5" fill="#C5A880" />
              <path d="M10 24C12 25.5 14 26 16 26C18 26 20 25.5 22 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[#2C241D] font-semibold text-sm sm:text-base tracking-normal mb-1">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-[#786454] leading-relaxed mb-5 max-w-[260px] font-normal">
            {subtitle}
          </p>
        )}

        {/* Minimalist Progress Bar with Continuous Luxury Shimmer */}
        <div className="w-full max-w-[240px] space-y-2">
          <div className="h-1.5 w-full bg-[#EFE6D8] rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-[#800E13] via-[#B22222] to-[#C5A880] rounded-full w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-full animate-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#A89887] font-medium px-0.5">
            <span>Đang chuẩn bị không gian</span>
            <span className="font-semibold text-[#800E13]">Di sản</span>
          </div>
        </div>

        {/* Small Brand Identity */}
        <div className="mt-4 pt-2.5 border-t border-[#F2ECE3] w-full flex items-center justify-center gap-1.5 text-[10px] text-[#A89887]">
          <span className="w-1 h-1 rounded-full bg-[#C5A880]" />
          <span>Nếp · Việt Phục Remix</span>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectCostumeForMix, 
    isLoading, 
    loadingMessage, 
    isAuthModalOpen, 
    closeAuthModal,
    isOnboardingModalOpen 
  } = useApp();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FBF8F3] text-[#2C241D] overflow-x-hidden">
      {/* Nền họa tiết lịch sử Việt Nam riêng biệt cho từng Phần */}
      {activeTab === 'explore' && <ExploreHeritageBackground />}
      {activeTab === 'mix' && <MixHeritageBackground />}
      {activeTab === 'critique' && <ExploreHeritageBackground />}
      {activeTab === 'settings' && <SettingsHeritageBackground />}
      {activeTab === 'history' && <MixHeritageBackground />}

      {/* Navbar with brand, tabs, and user profile pill */}
      <Navbar />

      {/* Main Feature View with bottom safe padding for mobile navigation bar */}
      <main className="flex-1 relative z-10 w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
        {activeTab === 'explore' && <ExploreSection />}

        {activeTab === 'mix' && <MixSection />}

        {activeTab === 'critique' && <OutfitCritiqueSection />}

        {activeTab === 'history' && (
          <Suspense 
            fallback={
              <SectionLoadingFallback 
                title="Tải Dòng Chảy Lịch Sử & Kho Lưu Trữ Cổ Phục" 
                subtitle="Hệ thống hóa tư liệu phục sức qua các thời kỳ Lý, Trần, Lê, Nguyễn"
              />
            }
          >
            <HistorySection />
          </Suspense>
        )}

        {activeTab === 'settings' && (
          <Suspense 
            fallback={
              <SectionLoadingFallback 
                title="Tải Hồ Sơ May Đo & Thông Số Cá Nhân" 
                subtitle="Đồng bộ tỷ lệ nhân trắc học và sở thích phục sức của bạn"
              />
            }
          >
            <SettingsSection />
          </Suspense>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />

      {/* Global Heritage Advisor Chatbot (Lazy Loaded) */}
      <Suspense fallback={null}>
        <HeritageAdvisorChatbot />
      </Suspense>

      {/* Footer */}
      <Footer />

      {/* Global Loading Spinner */}
      {isLoading && <Loading message={loadingMessage} />}

      {/* Friendly Error Dialog */}
      <ErrorModal />

      {/* Firebase Authentication Modal (Lazy Loaded) */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </Suspense>
      )}

      {/* User Measurements & Onboarding Step after Login (Lazy Loaded) */}
      {isOnboardingModalOpen && (
        <Suspense fallback={null}>
          <ProfileOnboardingModal />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseAuthProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </FirebaseAuthProvider>
    </ErrorBoundary>
  );
}
