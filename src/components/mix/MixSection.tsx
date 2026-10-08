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

  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState<boolean>(false);
  const [activeWardrobeSelection, setActiveWardrobeSelection] = useState<UserWardrobeItem[]>([]);

  // When user selects items in Wardrobe and clicks "Phối cùng trang phục truyền thống"
  const handleMixWithTraditional = (selectedItems: UserWardrobeItem[]) => {
    setActiveWardrobeSelection(selectedItems);
    setIsWardrobeModalOpen(false);
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
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#800E13]/10 text-[#800E13] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#800E13]" />
            <span>Nếp • Tinh Hoa Cổ Phục & Nghệ Thuật Phối Sắc Đương Đại</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heritage font-bold text-[#2C241D] leading-tight">
            Khắc Họa Sắc Phục • Dệt Hồn Di Sản Việt
          </h1>
          <p className="text-xs text-[#786554] max-w-xl font-normal">
            Khoác lên mình dáng vóc ngàn năm gấm vóc Đại Việt, hòa nhịp cùng hơi thở thời trang đương đại và khí chất của chính bạn.
          </p>
        </div>

        {/* Action Buttons: Open Personal Wardrobe + Exit Button */}
        <div className="flex items-center gap-2 shrink-0">
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
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0 cursor-pointer"
            >
              Hủy chọn
            </button>
          </div>
        )}

        {/* Unified Traditional & Modern Fitting Flow */}
        <UnifiedFittingFlow
          initialWardrobeItems={activeWardrobeSelection}
          preselectedCostume={selectedCostumeForMix}
          onClearPreselectedCostume={() => {
            selectCostumeForMix(null as any);
          }}
          onClose={handleExitStudio}
        />
      </div>

      {/* Wardrobe Manager Modal */}
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
