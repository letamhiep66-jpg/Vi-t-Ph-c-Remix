import React, { useEffect, useState } from 'react';

interface LoadingProps {
  message?: string;
  submessage?: string;
  progress?: number;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Đang khởi tạo không gian trải nghiệm...', 
  submessage = 'Hòa quyện tinh hoa cổ phục cùng hơi thở đương đại',
  progress: explicitProgress
}) => {
  const [simulatedProgress, setSimulatedProgress] = useState(18);

  useEffect(() => {
    if (explicitProgress !== undefined) {
      setSimulatedProgress(explicitProgress);
      return;
    }

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 92) return 92;
        const step = Math.max(2, Math.floor((95 - prev) / 6));
        return Math.min(prev + step, 92);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [explicitProgress]);

  const displayProgress = explicitProgress !== undefined ? explicitProgress : simulatedProgress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBF8F3]/85 backdrop-blur-md transition-all duration-300 px-4">
      <div className="relative w-full max-w-md bg-white/95 rounded-2xl border border-[#E7DAC8] shadow-2xl p-7 sm:p-8 flex flex-col items-center text-center">
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C5A880]/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C5A880]/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C5A880]/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C5A880]/60 rounded-br-sm pointer-events-none" />

        {/* Minimalist Crest Emblem */}
        <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#800E13]/5 animate-soft-pulse" />
          <div className="w-12 h-12 rounded-full border border-[#DFD1BD] bg-[#FAF6F0] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 32 32" className="w-6 h-6 text-[#800E13]" fill="currentColor">
              {/* Minimalist Stylized Lotus Seal */}
              <path d="M16 4C16 8 13.5 11 11 14C13 14 15 13 16 11C17 13 19 14 21 14C18.5 11 16 4 16 4Z" opacity="0.9" />
              <path d="M11 14C8 14 5 17 6 21C9 21 12 18 13 16C12.2 15.3 11.5 14.7 11 14Z" opacity="0.75" />
              <path d="M21 14C24 14 27 17 26 21C23 21 20 18 19 16C19.8 15.3 20.5 14.7 21 14Z" opacity="0.75" />
              <circle cx="16" cy="19" r="1.5" fill="#C5A880" />
              <path d="M10 24C12 25.5 14 26 16 26C18 26 20 25.5 22 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[#2C241D] font-semibold text-base sm:text-lg tracking-tight mb-1.5">
          {message}
        </h3>

        {/* Subtitle */}
        {submessage && (
          <p className="text-xs sm:text-sm text-[#786454] leading-relaxed mb-6 max-w-xs font-normal">
            {submessage}
          </p>
        )}

        {/* Luxury Minimalist Progress Bar */}
        <div className="w-full max-w-[280px] space-y-2">
          <div className="h-1.5 w-full bg-[#EFE6D8] rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-[#800E13] via-[#B22222] to-[#C5A880] rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${displayProgress}%` }}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#A89887] font-medium px-0.5">
            <span>Tiến trình hoàn thiện</span>
            <span className="font-semibold text-[#800E13] tabular-nums">{Math.round(displayProgress)}%</span>
          </div>
        </div>

        {/* Brand identity footer */}
        <div className="mt-5 pt-3 border-t border-[#F2ECE3] w-full flex items-center justify-center gap-1.5 text-[11px] text-[#A89887]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
          <span className="tracking-wide">Nếp · Việt Phục Remix</span>
        </div>
      </div>
    </div>
  );
};
