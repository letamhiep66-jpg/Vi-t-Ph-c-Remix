import React from 'react';
import { Camera, Mic, ShieldCheck, X } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  type: 'camera' | 'microphone';
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  type,
  title,
  description,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isCamera = type === 'camera';
  const defaultTitle = isCamera 
    ? 'Yêu Cầu Quyền Truy Cập Camera' 
    : 'Yêu Cầu Quyền Truy Cập Micro';

  const defaultDesc = isCamera
    ? 'Nếp cần quyền sử dụng camera để bạn có thể chụp ảnh khuôn mặt và vóc dáng, giúp thử đồ Việt Phục ảo trực tiếp trên màn hình.'
    : 'Nếp cần quyền sử dụng micro để nhận diện giọng nói tiếng Việt, giúp bạn tìm kiếm trang phục hoặc mô tả sự kiện tham dự nhanh chóng mà không cần gõ phím.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FAF6F0] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DFD4C4] text-[#2C241D] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7B6858] hover:text-[#2C241D] hover:bg-[#EFE7DC] transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9B2226] to-[#800E13] flex items-center justify-center text-white shadow-lg shadow-[#9B2226]/25 mb-4">
            {isCamera ? (
              <Camera className="w-8 h-8 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <h3 className="font-heritage text-xl sm:text-2xl font-bold text-[#2C241D] tracking-tight">
            {title || defaultTitle}
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-[#6C584C] leading-relaxed">
            {description || defaultDesc}
          </p>

          {/* Privacy Reassurance Banner */}
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-[#EFE7DC]/70 border border-[#DFD4C4] text-left text-xs text-[#5C4D3C]">
            <ShieldCheck className="w-4 h-4 text-[#9B2226] shrink-0 mt-0.5" />
            <span>
              <strong>Bảo mật riêng tư:</strong> Dữ liệu {isCamera ? 'hình ảnh' : 'giọng nói'} chỉ được xử lý trực tiếp trên trình duyệt của bạn, hoàn toàn không được thu âm hay lưu trữ ngầm.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-[#DFD4C4] bg-white text-[#5C4D3C] hover:bg-[#F2ECE1] font-medium text-xs sm:text-sm transition-all"
            >
              Để Sau
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#9B2226] to-[#800E13] hover:from-[#BA2D32] hover:to-[#9B2226] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#9B2226]/20 transition-all flex items-center justify-center gap-2"
            >
              {isCamera ? <Camera className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>Đồng Ý & Tiếp Tục</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
