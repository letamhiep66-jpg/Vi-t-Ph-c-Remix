import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, WifiOff, Clock, ShieldAlert, X } from 'lucide-react';

export const ErrorModal: React.FC = () => {
  const { currentError, clearError } = useApp();

  if (!currentError) return null;

  const renderIcon = () => {
    switch (currentError.type) {
      case 'network':
        return <WifiOff className="w-8 h-8 text-[#9B2226]" />;
      case 'quota':
        return <Clock className="w-8 h-8 text-[#BC6C25]" />;
      case 'limit':
        return <ShieldAlert className="w-8 h-8 text-[#E76F51]" />;
      default:
        return <AlertCircle className="w-8 h-8 text-[#9B2226]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-[#E6DCCF] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Traditional red corner ribbon/accent */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute transform rotate-45 bg-[#9B2226] text-white font-bold text-[9px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
            NẾP
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={clearError}
          className="absolute top-4 left-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-4 flex flex-col items-center text-center">
          <div className="p-3 bg-[#F8F1E7] rounded-full mb-3 ring-8 ring-[#F8F1E7]/50">
            {renderIcon()}
          </div>

          <h3 className="font-heritage text-lg font-bold text-[#2C241D]">
            {currentError.title}
          </h3>

          <p className="mt-2 text-sm text-[#5C4D3C] leading-relaxed">
            {currentError.message}
          </p>

          {currentError.retryTime && (
            <div className="mt-3 py-1.5 px-3 bg-[#F4EDE2] rounded-lg text-xs font-medium text-[#800E13]">
              Thời gian dự kiến mở lại: {currentError.retryTime}
            </div>
          )}

          <div className="mt-6 flex gap-3 w-full">
            <button
              onClick={clearError}
              className="flex-1 py-2.5 px-4 bg-[#800E13] hover:bg-[#9B2226] active:bg-[#671114] text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
            >
              Đã hiểu, tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
