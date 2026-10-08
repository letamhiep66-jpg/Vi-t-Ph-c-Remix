import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { PermissionModal } from './PermissionModal';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  placeholderPrompt?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MIC_PERMISSION_KEY = 'nep_mic_permission_agreed';

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  placeholderPrompt = 'Nói tên trang phục hoặc mô tả sự kiện...',
  className = '',
  buttonClassName = '',
  size = 'md',
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

  const {
    isListening,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
  } = useVoiceInput({
    lang: 'vi-VN',
    onResult: (text) => {
      if (text) {
        onTranscript(text);
      }
    },
  });

  const [unsupportedMsg, setUnsupportedMsg] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (!isSupported) {
      setUnsupportedMsg('Trình duyệt hiện chưa hỗ trợ nhận diện giọng nói Web Speech.');
      setTimeout(() => setUnsupportedMsg(null), 3500);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    // Check if user already saw and consented to the gentle permission explanation
    const hasConsented = localStorage.getItem(MIC_PERMISSION_KEY) === 'true';
    if (!hasConsented) {
      setShowPermissionModal(true);
    } else {
      startListening();
    }
  };

  const handleConfirmPermission = () => {
    localStorage.setItem(MIC_PERMISSION_KEY, 'true');
    setShowPermissionModal(false);
    startListening();
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Microphone Trigger Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        title={isListening ? 'Đang nghe... Nhấn để dừng' : 'Nhập bằng giọng nói (Tiếng Việt)'}
        aria-label="Nhập giọng nói"
        className={`relative rounded-xl flex items-center justify-center transition-all ${sizeClasses} ${
          isListening
            ? 'bg-[#9B2226] text-white animate-pulse shadow-md shadow-[#9B2226]/40 ring-2 ring-[#9B2226]/30'
            : 'text-[#7B6858] hover:text-[#9B2226] hover:bg-[#F2ECE1] active:scale-95'
        } ${buttonClassName}`}
      >
        {isListening ? (
          <Mic className={`${iconSizes} animate-bounce`} />
        ) : (
          <Mic className={iconSizes} />
        )}

        {/* Pulse radar rings when actively listening */}
        {isListening && (
          <span className="absolute -inset-1 rounded-xl border border-[#9B2226] animate-ping opacity-60 pointer-events-none" />
        )}
      </button>

      {/* Floating Live Speech Recognition Status / Transcript Popover */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 min-w-[240px] max-w-xs sm:max-w-sm bg-[#1E1713] text-white p-3 rounded-2xl shadow-xl border border-[#3E3228] animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6B6B]">
              <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-ping" />
              <span>Đang thu âm tiếng Việt...</span>
            </div>
            <button
              onClick={stopListening}
              className="text-[10px] text-white/70 hover:text-white underline"
            >
              Hoàn tất
            </button>
          </div>

          <p className="text-xs text-stone-200 italic line-clamp-3">
            {interimTranscript ? `"${interimTranscript}"` : placeholderPrompt}
          </p>
        </div>
      )}

      {/* Error or unsupported message tooltip */}
      {(error || unsupportedMsg) && !isListening && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-60 bg-stone-900/95 text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-stone-700 animate-in fade-in">
          {unsupportedMsg || error}
        </div>
      )}

      {/* Gentle Explanation Permission Modal */}
      <PermissionModal
        isOpen={showPermissionModal}
        type="microphone"
        title="Bật Nhập Liệu Bằng Giọng Nói"
        description="Nếp sử dụng micro để lắng nghe và chuyển giọng nói tiếng Việt thành văn bản. Bạn có thể tìm nhanh mẫu áo hoặc mô tả sự kiện tham dự thuận tiện nhất."
        onConfirm={handleConfirmPermission}
        onCancel={() => setShowPermissionModal(false)}
      />
    </div>
  );
};
