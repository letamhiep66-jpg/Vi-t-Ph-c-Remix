import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserWardrobeItem } from '../../types';
import { UnifiedFittingFlow } from './UnifiedFittingFlow';
import { StylingStudio } from '../StylingStudio';
import { WardrobeManagerModal } from './WardrobeManagerModal';
import { 
  Sparkles, 
  ShoppingBag, 
  Layers, 
  User, 
  Wand2, 
  X 
} from 'lucide-react';

export const MixSection: React.FC = () => {
  const { 
    selectedCostumeForMix, 
    selectCostumeForMix, 
    setActiveTab, 
    wardrobeItems 
  } = useApp();

  const [studioMode, setStudioMode] = useState<'identity-studio' | 'multi-layer'>('identity-studio');
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState<boolean>(false);
  const [activeWardrobeSelection, setActiveWardrobeSelection] = useState<UserWardrobeItem[]>([]);

  // When user selects items in Wardrobe and clicks "Phối cùng trang phục truyền thống"
  const handleMixWithTraditional = (selectedItems: UserWardrobeItem[]) => {
    setActiveWardrobeSelection(selectedItems);
    setIsWardrobeModalOpen(false);
    setStudioMode('multi-layer');
  };

  const handleExitStudio = () => {
    selectCostumeForMix(null as any);
    setActiveTab('explore');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#FBF8F3] text-[#2C241D] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Top Header & Quick Actions Bar */}
      <div className="border-b border-[#E8DEC8] bg-[#F7F2E7]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#800E13]/10 text-[#800E13] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#800E13]" />
            <span>Xưởng Phối Đồ Nếp • Multimodal Generative AI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heritage font-bold text-[#2C241D] leading-tight">
            {studioMode === 'identity-studio' ? 'Phối Đồ Neo Giữ Nhân Dạng & Vóc Dáng' : 'Xưởng Thử Đồ Cổ Phục Đa Lớp'}
          </h1>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF3EA] rounded-2xl border border-[#DFD4C4]">
          <button
            type="button"
            onClick={() => setStudioMode('identity-studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'identity-studio'
                ? 'bg-[#800E13] text-white shadow-xs'
                : 'text-[#6C584C] hover:text-[#2C241D]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Neo Giữ Nhân Dạng</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('multi-layer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'multi-layer'
                ? 'bg-[#800E13] text-white shadow-xs'
                : 'text-[#6C584C] hover:text-[#2C241D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Phối Đồ Đa Lớp</span>
          </button>
        </div>

        {/* Action Buttons: Open Personal Wardrobe + Exit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWardrobeModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-stone-50 border border-[#DFD1BD] rounded-xl text-xs font-bold text-[#4A3E35] hover:text-[#800E13] transition-all shadow-2xs hover:shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#800E13]" />
            <span className="hidden sm:inline">Tủ Đồ Của Tôi</span>
            <span className="sm:hidden">Tủ đồ</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#800E13]/10 text-[#800E13] text-[10px] font-mono font-bold">
              {wardrobeItems.length}
            </span>
          </button>

          <button
            onClick={handleExitStudio}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-stone-100 hover:bg-rose-50 border border-stone-300 hover:border-rose-300 rounded-xl text-xs font-bold text-stone-700 hover:text-rose-700 transition-all shadow-2xs cursor-pointer"
            title="Đóng xưởng phối đồ và quay lại trang Khám phá"
          >
            <X className="w-4 h-4 text-rose-600" />
            <span>Đóng / Thoát</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 overflow-x-hidden">

        {/* Selected Wardrobe Banner Notice (if any) */}
        {activeWardrobeSelection.length > 0 && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Đang phối cùng <strong>{activeWardrobeSelection.length} món</strong> từ Tủ đồ cá nhân:{' '}
                {activeWardrobeSelection.map(item => item.name).join(', ')}
              </span>
            </div>
            <button
              onClick={() => setActiveWardrobeSelection([])}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0"
            >
              Hủy chọn
            </button>
          </div>
        )}

        {/* Studio Mode 1: Identity-Anchored Pipeline (Two-Step Gemini 3.8 Flash + Imagen 3) */}
        {studioMode === 'identity-studio' && (
          <StylingStudio onClose={handleExitStudio} />
        )}

        {/* Studio Mode 2: Multi-layer Traditional Fitting Flow */}
        {studioMode === 'multi-layer' && (
          <UnifiedFittingFlow
            initialWardrobeItems={activeWardrobeSelection}
            preselectedCostume={selectedCostumeForMix}
            onClearPreselectedCostume={() => {
              selectCostumeForMix(null as any);
            }}
            onClose={handleExitStudio}
          />
        )}
      </div>

      {/* Wardrobe Manager Modal (Requirement 3) */}
      {isWardrobeModalOpen && (
        <WardrobeManagerModal
          onClose={() => setIsWardrobeModalOpen(false)}
          onMixWithTraditional={handleMixWithTraditional}
        />
      )}
    </div>
  );
};

export default MixSection;
