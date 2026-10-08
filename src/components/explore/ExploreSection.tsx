import React, { useState, useEffect } from 'react';
import { TraditionalCostume } from '../../types';
import { getCostumes, TRADITIONAL_COSTUMES } from '../../services/costumeService';
import { CostumeDetailModal } from './CostumeDetailModal';
import { CostumeImage } from '../common/CostumeImage';
import { searchGroundedCostumeHistory, GroundingSearchResult } from '../../services/groundingService';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  X, 
  ChevronRight, 
  Sparkles, 
  Globe, 
  Loader2, 
  ExternalLink, 
  HelpCircle, 
  BookOpen, 
  MapPin,
  User,
  Users,
  Shirt,
  Wand2,
  Clock,
  Check
} from 'lucide-react';

export const ExploreSection: React.FC = () => {
  const { selectCostumeForMix, setActiveTab } = useApp();

  // Costumes State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('all');
  const [costumes, setCostumes] = useState<TraditionalCostume[]>([]);
  const [selectedCostume, setSelectedCostume] = useState<TraditionalCostume | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [cardPhotoModes, setCardPhotoModes] = useState<Record<string, string>>({});

  // Google Search Grounding states
  const [showGroundingPanel, setShowGroundingPanel] = useState<boolean>(false);
  const [groundingQuery, setGroundingQuery] = useState<string>('');
  const [groundingResult, setGroundingResult] = useState<GroundingSearchResult | null>(null);
  const [isGroundingLoading, setIsGroundingLoading] = useState<boolean>(false);

  const [updateTick, setUpdateTick] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateTick(t => t + 1);
    };
    window.addEventListener('nep_costumes_updated', handleUpdate);
    return () => window.removeEventListener('nep_costumes_updated', handleUpdate);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    setIsSearching(true);
    getCostumes(searchQuery, genderFilter).then((data) => {
      if (isCurrent) {
        if (selectedFilterId !== 'all') {
          const matched = data.filter(
            (c) => c.id === selectedFilterId || (selectedFilterId === 'ao-ngu-than' && c.id.startsWith('ao-ngu-than'))
          );
          setCostumes(matched.length > 0 ? matched : data);
        } else {
          setCostumes(data);
        }
        setIsSearching(false);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [searchQuery, genderFilter, selectedFilterId, updateTick]);

  // Dynamic Vietnamese Heritage Costumes classification filters according to active gender
  const allQuickFilters = [
    { label: 'Tất cả', id: 'all', gender: 'all' },
    { label: 'Áo Nhật Bình', id: 'ao-nhat-binh', gender: 'female' },
    { label: 'Áo Tứ Thân', id: 'ao-tu-than', gender: 'female' },
    { label: 'Áo Yếm', id: 'ao-yem', gender: 'female' },
    { label: 'Áo Dài Le Mur', id: 'ao-dai-lemur', gender: 'female' },
    { label: 'Áo Ngũ Thân', id: 'ao-ngu-than', gender: 'both' },
    { label: 'Áo Tấc', id: 'ao-tac-ngu-than-tay-thung', gender: 'both' },
    { label: 'Áo Viên Lĩnh', id: 'ao-vien-linh', gender: 'both' },
    { label: 'Áo Giao Lĩnh', id: 'ao-giao-linh', gender: 'both' },
    { label: 'Áo Đối Khâm', id: 'ao-doi-kham', gender: 'both' },
    { label: 'Áo Bà Ba', id: 'ao-ba-ba', gender: 'both' }
  ];

  const quickFilters = allQuickFilters.filter(f => {
    if (f.id === 'all') return true;
    if (genderFilter === 'female') {
      return f.gender === 'female' || f.gender === 'both';
    }
    if (genderFilter === 'male') {
      return f.gender === 'male' || f.gender === 'both';
    }
    return true;
  });

  const handleFilterClick = (filterId: string) => {
    setSelectedFilterId(filterId);
    if (filterId !== 'all') {
      setSearchQuery('');
    }
  };

  const handleGenderFilterChange = (gender: 'all' | 'male' | 'female' | 'unisex') => {
    setGenderFilter(gender);
    setSelectedFilterId('all'); // Reset specific costume filter so all items of the selected gender show immediately
  };

  const handleExecuteGrounding = async (queryText?: string) => {
    const q = queryText || groundingQuery;
    if (!q.trim()) return;

    setIsGroundingLoading(true);
    setShowGroundingPanel(true);
    try {
      const res = await searchGroundedCostumeHistory(q);
      setGroundingResult(res);
    } catch (e) {
      console.warn('Grounding error:', e);
    } finally {
      setIsGroundingLoading(false);
    }
  };


  const getCardImage = (costume: TraditionalCostume): string => {
    try {
      const custom = localStorage.getItem(`nep_custom_costume_photo_${costume.id}`);
      if (custom) return custom;
    } catch {}

    const isUnisex = costume.gender === 'unisex' || costume.genderSupport === 'both';
    const mode = cardPhotoModes[costume.id];

    if (mode === 'male') return costume.maleFrontImage || costume.maleTopImage || costume.frontImage;
    if (mode === 'female') return costume.femaleFrontImage || costume.femaleTopImage || costume.frontImage;

    if (isUnisex) {
      if (genderFilter === 'male') return costume.maleFrontImage || costume.maleTopImage || costume.frontImage;
      if (genderFilter === 'female') return costume.femaleFrontImage || costume.femaleTopImage || costume.frontImage;
    }
    if (costume.gender === 'male' && costume.maleFrontImage) return costume.maleFrontImage;
    if (costume.gender === 'female' && costume.femaleFrontImage) return costume.femaleFrontImage;

    return costume.frontImage;
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1E1713]/5 text-[#4A3E35] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 border border-[#1E1713]/10">
          <Sparkles className="w-3.5 h-3.5 text-[#9B2226]" />
          <span>Kho Tàng Cổ Phục & Phụ Kiện Chuẩn Mực Việt Nam</span>
        </div>
        <h1 className="font-heritage text-2xl sm:text-4xl font-bold text-[#1E1713] tracking-tight">
          Khám Phá Di Sản Việt Phục
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6C584C] max-w-2xl mx-auto leading-relaxed">
          Tra cứu 10 mẫu cổ phục chuẩn mực qua các triều đại. Bấm vào từng trang phục để xem cấu trúc may đo, điển chế lịch sử và các phụ kiện đi cùng đặc trưng (nón ba tầm, nón lá, khăn đóng, kiềng bạc...).
        </p>
      </div>

      {/* Main Costumes Gallery */}
      <div className="space-y-6">
          {/* Gender Segmented Switcher & Search Bar */}
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {/* Gender Category Segmented Tabs */}
            <div className="flex p-1 bg-[#EFE7DD] rounded-2xl max-w-md mx-auto border border-[#DFD1BD] w-full shadow-2xs">
              <button
                type="button"
                onClick={() => handleGenderFilterChange('all')}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  genderFilter === 'all'
                    ? 'bg-white text-[#800E13] shadow-xs font-bold'
                    : 'text-[#5C4D3C] hover:text-[#2C241D]'
                }`}
              >
                Tất Cả (10)
              </button>
              <button
                type="button"
                onClick={() => handleGenderFilterChange('female')}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  genderFilter === 'female'
                    ? 'bg-[#800E13] text-white shadow-xs font-bold'
                    : 'text-[#5C4D3C] hover:text-[#2C241D]'
                }`}
              >
                <span>Trang Phục Nữ ♀ (10)</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenderFilterChange('male')}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  genderFilter === 'male'
                    ? 'bg-[#1D3557] text-white shadow-xs font-bold'
                    : 'text-[#5C4D3C] hover:text-[#2C241D]'
                }`}
              >
                <span>Trang Phục Nam ♂ (6)</span>
              </button>
            </div>

            {/* Search input with live clear & Voice Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#786454]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedFilterId !== 'all') {
                    setSelectedFilterId('all');
                  }
                }}
                placeholder="Tìm theo tên trang phục (Áo Dài, Tứ Thân, Ngũ Thân...), triều đại, dịp mặc..."
                className="w-full pl-12 pr-24 py-2.5 sm:py-3.5 bg-white border border-[#DFD5C6] rounded-2xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#9B2226]/30 focus:border-[#9B2226] transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilterId('all');
                    }}
                    className="p-1.5 text-[#786454] hover:text-[#2C241D] rounded-lg transition-colors cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <VoiceInputButton
                  onTranscript={(text: string) => {
                    setSearchQuery(text);
                    setSelectedFilterId('all');
                  }}
                  buttonClassName="p-2"
                />
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-xs text-[#7B6858] mr-1 hidden sm:inline font-medium">Phân loại trang phục:</span>
              {quickFilters.map((filter) => {
                const isSelected = selectedFilterId === filter.id && (!searchQuery || filter.id !== 'all');
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#800E13] text-white shadow-xs font-semibold'
                        : 'bg-[#EFE7DD] text-[#55473D] hover:bg-[#E5DACD]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Search Grounding Feature Banner */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#DFD1BD] bg-[#FAF5EE] p-4 shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#800E13] text-white flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2C241D]">
                      Khảo Cứu Lịch Sử với Google Search Grounding
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#6C584C]">
                      Xác thực điển chế triều đình, tài liệu học thuật và bảo tàng mới nhất
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGroundingPanel(!showGroundingPanel)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#DFD1BD] hover:border-[#800E13] text-[#800E13] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showGroundingPanel ? 'Thu gọn' : 'Tra cứu trực tuyến'}</span>
                </button>
              </div>

              {/* Expandable Grounding Panel */}
              {showGroundingPanel && (
                <div className="mt-4 pt-4 border-t border-[#EAE0D3] space-y-3 animate-in fade-in">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={groundingQuery}
                      onChange={(e) => setGroundingQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExecuteGrounding()}
                      placeholder="Nhập câu hỏi khảo cứu điển chế (VD: Điển chế áo Nhật Bình...)"
                      className="flex-1 px-3 py-2 bg-white border border-[#DFD5C6] rounded-xl text-xs text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30"
                    />
                    <button
                      onClick={() => handleExecuteGrounding()}
                      disabled={isGroundingLoading || !groundingQuery.trim()}
                      className="px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGroundingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Tra Cứu</span>}
                    </button>
                  </div>

                  {groundingResult && (
                    <div className="p-3.5 bg-white rounded-xl border border-[#E3D6C5] space-y-2 text-xs text-[#4A3E35]">
                      <p className="leading-relaxed whitespace-pre-line">{groundingResult.text}</p>
                      {groundingResult.sources && groundingResult.sources.length > 0 && (
                        <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-[10px] text-[#800E13]">
                          <span className="font-semibold text-stone-500">Nguồn tra cứu:</span>
                          {groundingResult.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-0.5"
                            >
                              <span>{s.title || s.url}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Costumes Grid */}
          {isSearching ? (
            <div className="text-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#800E13] mx-auto mb-2" />
              <p className="text-sm text-[#786454]">Đang tra cứu kho lưu trữ cổ phục...</p>
            </div>
          ) : costumes.length === 0 ? (
            <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-[#DFD5C6] max-w-lg mx-auto p-8">
              <p className="font-heritage text-lg text-[#2C241D] font-bold">Không tìm thấy trang phục phù hợp</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGenderFilter('all');
                  setSelectedFilterId('all');
                }}
                className="mt-4 px-4 py-2 bg-[#9B2226] text-white text-xs font-medium rounded-xl hover:bg-[#800E13] transition-colors cursor-pointer"
              >
                Xem toàn bộ 10 trang phục
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {costumes.map((costume) => {
                const displayImg = getCardImage(costume);
                const isFemaleExclusive = costume.gender === 'female';
                const isMaleExclusive = costume.gender === 'male';

                // Trang phục cả nam và nữ đều mặc được thì để cho cả nam và nữ, không hiển thị thêm Phiên bản nam hay Phiên bản nữ trên ảnh
                let genderBadge = { text: 'Phù hợp cả Nam & Nữ', color: 'bg-emerald-900/85 text-emerald-100 border-emerald-300/40' };
                if (isFemaleExclusive) {
                  genderBadge = { text: 'Quy chuẩn Nữ ♀', color: 'bg-rose-900/90 text-rose-100 border-rose-300/40' };
                } else if (isMaleExclusive) {
                  genderBadge = { text: 'Quy chuẩn Nam ♂', color: 'bg-[#1D3557]/95 text-blue-100 border-blue-300/40' };
                }

                return (
                  <div
                    key={costume.id}
                    onClick={() => setSelectedCostume(costume)}
                    className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E9DFD1] shadow-xs hover:shadow-xl hover:border-[#D4A373] transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-72 w-full overflow-hidden bg-[#EFE8DC]">
                      <CostumeImage
                        src={displayImg}
                        alt={costume.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-85 group-hover:opacity-95 transition-opacity pointer-events-none" />

                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center z-10">
                        <span className="text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                          {costume.dynasty}
                        </span>
                        {costume.region && (
                          <span className="text-[10px] font-medium text-white/95 bg-[#800E13]/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {costume.region}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-4 right-4 z-10">
                        <h3 className="font-heritage text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-[#E9C46A] transition-colors">
                          {costume.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs sm:text-sm text-[#5C4D3C] line-clamp-2 leading-relaxed">
                        {costume.shortDesc}
                      </p>

                      <div className="mt-4 pt-3.5 border-t border-[#F0E6D8] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#9B2226] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Xem chi tiết & phụ kiện</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>

                        <span className="text-[11px] text-[#8C7A6B]">
                          {costume.era}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Costume Detail Modal */}
      {selectedCostume && (
        <CostumeDetailModal
          costume={selectedCostume}
          onClose={() => setSelectedCostume(null)}
        />
      )}
    </div>
  );
};

export default ExploreSection;
