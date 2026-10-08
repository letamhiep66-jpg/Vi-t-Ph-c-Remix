import React, { useState } from 'react';
import { TraditionalAccessory } from '../../data/accessoriesData';
import { AccessoryImage } from '../common/AccessoryImage';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  Check, 
  ChevronRight, 
  Layers, 
  Compass, 
  Heart,
  Share2
} from 'lucide-react';

interface AccessoryDetailModalProps {
  accessory: TraditionalAccessory;
  onClose: () => void;
  onSelectForMix?: (accessory: TraditionalAccessory) => void;
}

export const AccessoryDetailModal: React.FC<AccessoryDetailModalProps> = ({
  accessory,
  onClose,
  onSelectForMix
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        className="relative flex flex-col w-full max-w-3xl bg-[#FFFDF9] rounded-3xl shadow-2xl overflow-hidden border border-[#E9DFD1] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DFD1] bg-[#F5EDE1]/90">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#800E13]/10 text-[#800E13] text-[10px] font-bold uppercase tracking-wider">
              {accessory.badge}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              accessory.gender === 'female'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : accessory.gender === 'male'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {accessory.genderLabel}
            </span>
            <span className="text-xs text-[#6C584C] font-medium hidden sm:inline">
              {accessory.categoryLabel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Top Section: Image & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Box */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#E9DFD1] shadow-md flex items-center justify-center p-3">
                <AccessoryImage
                  src={accessory.image}
                  fallbackSrc={accessory.image}
                  alt={accessory.name}
                  className="w-full h-full object-contain drop-shadow-md"
                />

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/65 text-[#E9C46A] text-[9px] font-bold">
                  {accessory.region}
                </div>
              </div>

              {/* Nhãn ảnh minh họa */}
              <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-[#F5EDE1] rounded-xl text-[11px] font-semibold text-[#800E13]">
                <Sparkles className="w-3.5 h-3.5 text-[#800E13]" />
                <span>Ảnh minh họa hiện vật</span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-bold text-[#800E13] uppercase tracking-wider block">
                Phụ Kiện Cổ Truyền Đặc Trưng
              </span>
              <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-[#2C241D]">
                {accessory.name}
              </h2>

              <div className="flex flex-wrap gap-2 text-xs text-[#5C4D3C] pt-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold ${
                  accessory.gender === 'female'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : accessory.gender === 'male'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    accessory.gender === 'female' ? 'bg-rose-500' : accessory.gender === 'male' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <span>{accessory.genderLabel}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0] rounded-lg border border-[#E9DFD1]">
                  <Clock className="w-3.5 h-3.5 text-[#800E13]" />
                  <span>{accessory.dynastyOrEra}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0] rounded-lg border border-[#E9DFD1]">
                  <MapPin className="w-3.5 h-3.5 text-[#800E13]" />
                  <span>Vùng: {accessory.region}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF5EE] rounded-2xl border border-[#EADFCF] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13] block">
                  Cổ phục tiêu chuẩn phối cùng:
                </span>
                <p className="text-xs font-semibold text-[#2C241D]">
                  {accessory.matchingCostumesText}
                </p>
              </div>
            </div>
          </div>

          {/* Historical Origins */}
          <div className="space-y-2 pt-2 border-t border-[#E9DFD1]">
            <h4 className="font-heritage text-base font-bold text-[#2C241D] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#800E13]" />
              <span>Nguồn Gốc & Xuất Xứ Lịch Sử</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed bg-[#FCFAF7] p-4 rounded-2xl border border-[#EFE5D8]">
              {accessory.historicalOrigins}
            </p>
          </div>

          {/* Cultural Meaning */}
          <div className="space-y-2">
            <h4 className="font-heritage text-base font-bold text-[#2C241D] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#800E13]" />
              <span>Ý Nghĩa Biểu Tượng & Mỹ Học Văn Hóa</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed bg-[#FCFAF7] p-4 rounded-2xl border border-[#EFE5D8]">
              {accessory.culturalMeaning}
            </p>
          </div>

          {/* Wearing Guide & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-[#FAF5EE] rounded-2xl border border-[#EADFCF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13] block">
                Quy Thức Sử Dụng Đúng Chuẩn
              </span>
              <p className="text-xs text-[#5C4D3C] leading-relaxed">
                {accessory.wearingGuide}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-[#FAF5EE] rounded-2xl border border-[#EADFCF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13] block">
                Đặc Trưng Nhận Diện
              </span>
              <ul className="space-y-1 text-xs text-[#5C4D3C]">
                {accessory.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#800E13] font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F8F3EC] border-t border-[#E9DFD1] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-50 text-[#6C584C] border border-[#D5C2AF] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {onSelectForMix && (
            <button
              onClick={() => {
                onSelectForMix(accessory);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#800E13]/25 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#E9C46A]" />
              <span>Phối Món Này Với Cổ Phục Ngay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessoryDetailModal;
