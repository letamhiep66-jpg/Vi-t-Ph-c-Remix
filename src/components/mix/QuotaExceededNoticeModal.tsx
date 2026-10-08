import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ArrowRight,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { getSavedGeminiApiKey, saveGeminiApiKey } from '../../utils/apiKeyStorage';

interface QuotaExceededNoticeModalProps {
  isOpen: boolean;
  retryAfterHours?: number;
  onClose: () => void;
  onSwitchToStudioMode: () => void;
  onRetryWithApiKey?: (apiKey: string) => void;
}

export const QuotaExceededNoticeModal: React.FC<QuotaExceededNoticeModalProps> = ({
  isOpen,
  retryAfterHours = 14,
  onClose,
  onSwitchToStudioMode,
  onRetryWithApiKey
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getSavedGeminiApiKey());
  const [isEnteringKey, setIsEnteringKey] = useState<boolean>(false);
  const [keySavedSuccess, setKeySavedSuccess] = useState<boolean>(false);

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(3600, (retryAfterHours || 14) * 3600);
  });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedHours = hours > 0 ? `${hours}` : '1';
  const displayHeadline = `Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ${formattedHours} giờ`;

  const handleSaveAndRetry = () => {
    const cleanKey = apiKeyInput.trim();
    if (cleanKey) {
      saveGeminiApiKey(cleanKey);
      setKeySavedSuccess(true);
      setTimeout(() => {
        onRetryWithApiKey?.(cleanKey);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl overflow-hidden border border-[#E9DFD1] my-auto">
        
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-[#800E13] via-[#9B2226] to-[#6A040F] p-6 text-white text-center space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-7 h-7 text-[#E9C46A] animate-pulse" />
          </div>

          <h3 className="font-heritage text-lg sm:text-xl font-bold leading-snug text-[#FFF8EB] max-w-md mx-auto">
            {displayHeadline}
          </h3>

          {/* Countdown Clock Display */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/20 text-xs font-mono text-amber-200">
            <span>⏳ Thời gian mở lại dự kiến:</span>
            <span className="font-bold text-white">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DAC8] text-xs text-[#5C4D3C] space-y-1.5 leading-relaxed">
            <p className="font-semibold text-[#2C241D] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hạn mức tạo ảnh miễn phí hôm nay đã đạt giới hạn</span>
            </p>
            <p>
              Mô hình tạo ảnh trực tiếp <strong>Nano Banana Pro (Google Gemini Image)</strong> sử dụng hạn mức dùng chung miễn phí mỗi ngày. Khi hết lượt trong ngày, hệ thống sẽ tạm dừng cho đến chu kỳ làm mới kế tiếp.
            </p>
          </div>

          {/* Option 1: Recommend Switching to Studio Portrait Synthesizer (100% Free, Instant) */}
          <div className="p-4 rounded-2xl border-2 border-[#800E13] bg-gradient-to-br from-[#FFF9F3] to-[#FFF3E6] space-y-3 relative overflow-hidden shadow-xs">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#800E13] text-[#E9C46A] text-[10px] font-bold uppercase tracking-wider">
              Khuyên Dùng • 100% Miễn Phí
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#800E13] text-[#E9C46A] flex items-center justify-center shrink-0 shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div className="space-y-1 pr-16">
                <h4 className="font-heritage text-sm font-bold text-[#2C241D]">
                  Chuyển Sang Chân Dung Studio Người Thật
                </h4>
                <p className="text-xs text-[#6C584C] leading-relaxed">
                  Ghép khuôn mặt và vóc dáng thật của bạn vào bộ cổ phục đã chọn với ánh sáng Studio sắc nét 8K. <strong>Không tốn quota, tạo ngay tức thì.</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSwitchToStudioMode();
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#800E13] hover:bg-[#9B2226] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#800E13]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#E9C46A]" />
              <span>Dùng Chân Dung Studio Người Thật Ngay (Miễn Phí)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Enter Personal Gemini API Key (Unlimited Nano Banana Pro) */}
          <div className="p-4 rounded-2xl border border-[#DFD4C4] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#800E13]" />
                <h4 className="text-xs font-bold text-[#2C241D]">
                  Hoặc: Nhập API Key Nano Banana / Gemini Cá Nhân
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEnteringKey(!isEnteringKey)}
                className="text-xs font-bold text-[#800E13] hover:underline cursor-pointer"
              >
                {isEnteringKey ? 'Thu gọn' : 'Nhập Key'}
              </button>
            </div>

            <p className="text-[11px] text-[#7B6858] leading-relaxed">
              Nếu bạn có Google Gemini API Key riêng (miễn phí từ Google AI Studio), bạn có thể nhập vào đây để tiếp tục tạo ảnh không giới hạn mà không bị ảnh hưởng bởi hạn mức dùng chung.
            </p>

            {isEnteringKey && (
              <div className="space-y-2.5 pt-1 animate-in fade-in">
                <div className="relative">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Dán API Key (bắt đầu bằng AIzaSy...)"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#800E13] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Lấy API Key miễn phí tại Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={handleSaveAndRetry}
                    disabled={!apiKeyInput.trim()}
                    className="px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {keySavedSuccess ? 'Đang kích hoạt...' : 'Lưu & Thử Lại'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Close */}
        <div className="px-6 py-3.5 bg-[#FAF6F0] border-t border-[#E8DAC8] flex items-center justify-between text-xs">
          <span className="text-[#8C7A6B] text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nếp · Bảo vệ trải nghiệm di sản của bạn</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[#5C4D3C] hover:text-[#2C241D] font-semibold cursor-pointer"
          >
            Đóng thông báo
          </button>
        </div>

      </div>
    </div>
  );
};
