import React, { useState, useEffect } from 'react';
import { MixOption, CanvasLayerState, CulturalCheck } from '../../types';
import { useApp } from '../../context/AppContext';
import { evaluateOutfitMix } from '../../utils/culturalRuleChecker';
import { TRADITIONAL_COLORS, MODERN_COLORS, MODERN_GARMENTS, ACCESSORY_ITEMS } from '../../services/costumeService';
import { LookbookExportModal } from './LookbookExportModal';
import { CostumeImage } from '../common/CostumeImage';
import { composeEditorialFittingImage } from '../../utils/fittingCanvasComposer';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Wand2, FileText, ArrowRight } from 'lucide-react';

interface VirtualFittingResultModalProps {
  outfit: MixOption | CanvasLayerState;
  userPhotoUrl: string;
  onClose: () => void;
}

export const VirtualFittingResultModal: React.FC<VirtualFittingResultModalProps> = ({
  outfit: initialOutfit,
  userPhotoUrl,
  onClose
}) => {
  const { userProfile } = useApp();
  const [currentOutfit, setCurrentOutfit] = useState<MixOption | CanvasLayerState>(initialOutfit);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [assistedFixed, setAssistedFixed] = useState<boolean>(false);
  const [compositeImageUrl, setCompositeImageUrl] = useState<string>('');

  const isMixOption = 'costume' in currentOutfit;
  const costume = isMixOption ? currentOutfit.costume : currentOutfit.traditional;
  const modern = isMixOption ? currentOutfit.modernGarment : currentOutfit.modern;
  const accessory = isMixOption ? currentOutfit.accessories[0] : currentOutfit.accessory;
  const traditionalColor = isMixOption ? currentOutfit.colorPalette[0] : currentOutfit.traditionalColor;
  const modernColor = isMixOption ? currentOutfit.colorPalette[1] : currentOutfit.modernColor;

  // Check if outfit utilizes user's own wardrobe item
  const userWardrobePiece: any = (() => {
    if (modern && ('addedAt' in modern || modern.id?.startsWith('wardrobe-'))) return modern;
    if (accessory && ('addedAt' in accessory || accessory.id?.startsWith('wardrobe-'))) return accessory;
    return null;
  })();
  const [culturalCheck, setCulturalCheck] = useState<CulturalCheck>(() => {
    if (isMixOption && currentOutfit.culturalCheck) {
      return currentOutfit.culturalCheck;
    }
    return evaluateOutfitMix(
      costume,
      modern,
      accessory,
      traditionalColor,
      modernColor
    );
  });

  // Tự động kết xuất bức ảnh người thật đang mặc cổ phục đã phối
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const rendered = await composeEditorialFittingImage({
          userPhoto: userPhotoUrl,
          costumeImage: costume.frontImage,
          costumeId: costume.id,
          costumeName: costume.name,
          dynasty: costume.dynasty,
          gender: (userProfile?.gender as any) || 'female',
          height: userProfile?.height || 165,
          weight: userProfile?.weight || 52,
          skinTone: 'natural',
          accessories: accessory ? [{ id: accessory.id, name: accessory.name }] : []
        });
        if (isMounted && rendered) {
          setCompositeImageUrl(rendered);
        }
      } catch (err) {
        console.log('[ModalFitting] Synthesis note:', err);
      }
    })();
    return () => { isMounted = false; };
  }, [costume, accessory, userPhotoUrl, userProfile]);

  // "Giúp đỡ chỉnh sửa" action: fixes any yellow/red warnings to optimal heritage combination
  const handleAutoAssistFix = () => {
    const fixedTradColor = TRADITIONAL_COLORS[0]; // Đỏ điều
    const fixedModColor = MODERN_COLORS[0]; // Kem sữa
    const fixedModern = MODERN_GARMENTS[1]; // culottes
    const fixedAccessory = ACCESSORY_ITEMS[1]; // Túi gấm

    if (isMixOption) {
      const updated: MixOption = {
        ...currentOutfit,
        modernGarment: fixedModern,
        accessories: [fixedAccessory],
        colorPalette: [fixedTradColor, fixedModColor],
        harmonyScore: 98,
        culturalCheck: evaluateOutfitMix(
          costume,
          fixedModern,
          fixedAccessory,
          fixedTradColor,
          fixedModColor
        )
      };
      setCurrentOutfit(updated);
      setCulturalCheck(updated.culturalCheck);
    } else {
      const updated: CanvasLayerState = {
        ...currentOutfit,
        modern: fixedModern,
        accessory: fixedAccessory,
        traditionalColor: fixedTradColor,
        modernColor: fixedModColor
      };
      setCurrentOutfit(updated);
      setCulturalCheck(
        evaluateOutfitMix(
          costume,
          fixedModern,
          fixedAccessory,
          fixedTradColor,
          fixedModColor
        )
      );
    }

    setAssistedFixed(true);
  };

  const renderTrafficLightBadge = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hợp chuẩn văn hóa</span>
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cần lưu ý</span>
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Chưa phù hợp</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl max-h-[92vh] bg-[#FFFDF9] rounded-3xl shadow-2xl overflow-hidden border border-[#E9DFD1] my-auto">
        {/* Left: Composite Fitting Preview (User Portrait + Costume Mockup) */}
        <div className="relative w-full lg:w-5/12 bg-stone-900 h-80 lg:h-auto overflow-hidden flex flex-col justify-end">
          <div className="absolute inset-0">
            {/* Composite human portrait in traditional outfit */}
            <img
              src={compositeImageUrl || costume.frontImage}
              alt={costume.name}
              className="w-full h-full object-cover opacity-95 transition-opacity duration-300"
            />
            {/* Floating user portrait badge in top corner */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
              <img
                src={userPhotoUrl}
                alt="Chân dung bạn"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#E9C46A]"
              />
              <div className="text-white text-xs">
                <span className="block font-semibold">{userProfile?.name || 'Khách Quý Nếp'}</span>
                <span className="text-[10px] text-stone-300">Ảnh đã khớp tỷ lệ</span>
              </div>
            </div>

            {/* Equipment Floating Badge: When outfit uses an item from User Wardrobe */}
            {userWardrobePiece && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/75 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-amber-400/50 shadow-lg animate-in fade-in">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-stone-800 border border-amber-300/50 shrink-0">
                  <img
                    src={userWardrobePiece.frontImage || userWardrobePiece.image}
                    alt={userWardrobePiece.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-white text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                    Món đồ của bạn
                  </span>
                  <span className="text-xs font-semibold max-w-[120px] truncate block text-amber-100">
                    {userWardrobePiece.name}
                  </span>
                </div>
              </div>
            )}

            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />
          </div>

          {/* Bottom Overlay Info */}
          <div className="relative p-5 text-white z-10">
            <span className="text-xs uppercase tracking-widest text-[#E9C46A] font-bold">
              Bản Phối Trực Quan
            </span>
            <h3 className="font-heritage text-xl sm:text-2xl font-bold mt-0.5">
              {costume.name}
            </h3>
            <p className="text-xs text-stone-300 mt-1 line-clamp-2">
              {costume.shortDesc}
            </p>
          </div>
        </div>

        {/* Right: Cultural Validation & Result Export */}
        <div className="flex-1 flex flex-col p-6 sm:p-7 overflow-y-auto bg-[#FBF8F3]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#800E13] tracking-wider">
                  Kết Quả Thử Đồ & Kiểm Định Văn Hóa
                </span>
              </div>
              <h2 className="font-heritage text-2xl font-bold text-[#2C241D] mt-0.5">
                Bảng Thẩm Định Cổ Phục
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {assistedFixed && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã tự động chuẩn hóa các chi tiết theo điển chế cổ phục!</span>
            </div>
          )}

          {/* Traffic Light Cultural Factors */}
          <div className="mt-5 space-y-3.5">
            {/* 1. Dáng áo */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9DFD1] shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C241D]">
                  1. Dáng Áo & Cấu Trúc
                </span>
                {renderTrafficLightBadge(culturalCheck.silhouette.status)}
              </div>
              <p className="text-xs text-[#5C4D3C] leading-relaxed">
                {culturalCheck.silhouette.note}
              </p>
              {culturalCheck.silhouette.suggestion && (
                <p className="text-[11px] text-[#9B2226] font-medium pt-1">
                  💡 Gợi ý: {culturalCheck.silhouette.suggestion}
                </p>
              )}
            </div>

            {/* 2. Phụ kiện */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9DFD1] shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C241D]">
                  2. Phụ Kiện Đi Kèm
                </span>
                {renderTrafficLightBadge(culturalCheck.accessories.status)}
              </div>
              <p className="text-xs text-[#5C4D3C] leading-relaxed">
                {culturalCheck.accessories.note}
              </p>
              {culturalCheck.accessories.suggestion && (
                <p className="text-[11px] text-[#9B2226] font-medium pt-1">
                  💡 Gợi ý: {culturalCheck.accessories.suggestion}
                </p>
              )}
            </div>

            {/* 3. Màu sắc & Họa tiết theo dịp */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9DFD1] shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C241D]">
                  3. Màu Sắc & Phép Ứng Đối
                </span>
                {renderTrafficLightBadge(culturalCheck.occasionColor.status)}
              </div>
              <p className="text-xs text-[#5C4D3C] leading-relaxed">
                {culturalCheck.occasionColor.note}
              </p>
              {culturalCheck.occasionColor.suggestion && (
                <p className="text-[11px] text-[#9B2226] font-medium pt-1">
                  💡 Gợi ý: {culturalCheck.occasionColor.suggestion}
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-[#E9DFD1] flex flex-col sm:flex-row gap-3">
            {/* "Giúp đỡ chỉnh sửa" Button */}
            {(culturalCheck.overallStatus !== 'green' || !assistedFixed) && (
              <button
                onClick={handleAutoAssistFix}
                className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-stone-50 border border-[#CBB9A1] text-[#800E13] font-medium text-xs rounded-xl transition-all shadow-xs"
              >
                <Wand2 className="w-4 h-4 text-[#800E13]" />
                <span>Giúp đỡ chỉnh sửa chuẩn mực</span>
              </button>
            )}

            {/* "Xuất kết quả" Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-[#800E13] hover:bg-[#9B2226] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-[#800E13]/25 hover:scale-102"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Phiếu Phối Đồ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lookbook Export Modal */}
      {showExportModal && (
        <LookbookExportModal
          outfit={currentOutfit}
          userPhotoUrl={userPhotoUrl}
          userProfile={userProfile}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
