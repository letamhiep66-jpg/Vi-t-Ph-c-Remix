import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SavedLookbookItem } from '../../types';
import { VietnamMapWithIslands } from '../common/VietnamMapWithIslands';
import { DongSonWatermark } from '../common/DongSonWatermark';
import { NepLavisLogo } from '../common/NepLavisLogo';
import { 
  History, 
  Search, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Download, 
  Sparkles, 
  Layers, 
  Calendar, 
  Eye, 
  X, 
  Check, 
  Share2, 
  Award,
  Filter,
  Plus,
  Users
} from 'lucide-react';

export const HistorySection: React.FC = () => {
  const { 
    lookbookHistory, 
    deleteLookbook, 
    updateLookbookTitle, 
    clearLookbookHistory, 
    restoreLookbookToCanvas, 
    setActiveTab, 
    setMixSubflow,
    userProfile 
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score'>('newest');

  // Modal states
  const [activePreviewLookbook, setActivePreviewLookbook] = useState<SavedLookbookItem | null>(null);
  const [renamingLookbook, setRenamingLookbook] = useState<{ id: string; title: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Extract all unique occasions for filter chips
  const availableOccasions = useMemo(() => {
    const set = new Set<string>();
    lookbookHistory.forEach((item) => {
      if (item.occasion) set.add(item.occasion.trim());
    });
    return Array.from(set);
  }, [lookbookHistory]);

  // Filtered & sorted lookbooks
  const filteredLookbooks = useMemo(() => {
    let list = [...lookbookHistory];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.costumeName.toLowerCase().includes(q) ||
          item.modernGarmentName.toLowerCase().includes(q) ||
          (item.occasion?.toLowerCase().includes(q) ?? false) ||
          item.accessoryNames?.some((a) => a.toLowerCase().includes(q))
        );
      });
    }

    // Occasion filter
    if (selectedOccasionFilter !== 'all') {
      list = list.filter((item) => item.occasion === selectedOccasionFilter);
    }

    // Sorting
    if (sortBy === 'score') {
      list.sort((a, b) => (b.harmonyScore || 90) - (a.harmonyScore || 90));
    } else if (sortBy === 'oldest') {
      // Keep natural reverse or parse IDs
      list.reverse();
    } // 'newest' is default insertion order

    return list;
  }, [lookbookHistory, searchQuery, selectedOccasionFilter, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = lookbookHistory.length;
    if (total === 0) return { total: 0, avgScore: 0, topCostume: 'Chưa có' };
    const avgScore = Math.round(
      lookbookHistory.reduce((acc, curr) => acc + (curr.harmonyScore || 90), 0) / total
    );

    // Count frequency of costumes
    const costumeCounts: Record<string, number> = {};
    lookbookHistory.forEach((item) => {
      costumeCounts[item.costumeName] = (costumeCounts[item.costumeName] || 0) + 1;
    });

    let topCostume = 'Chưa có';
    let maxCount = 0;
    Object.entries(costumeCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCostume = name;
      }
    });

    return { total, avgScore, topCostume };
  }, [lookbookHistory]);

  const handleDownloadImage = (item: SavedLookbookItem) => {
    setDownloadSuccess(true);
    const link = document.createElement('a');
    link.href = item.compositeImage;
    link.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareLookbook = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSaveRename = () => {
    if (renamingLookbook && renamingLookbook.title.trim()) {
      updateLookbookTitle(renamingLookbook.id, renamingLookbook.title.trim());
      setRenamingLookbook(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#800E13]/10 text-[#800E13] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#800E13]/20">
          <History className="w-3.5 h-3.5" />
          <span>Kho Lưu Trữ Phong Cách Cá Nhân</span>
        </div>
        <h1 className="font-heritage text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1713] tracking-tight">
          Lịch Sử Sáng Tạo Lookbook
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#6C584C] max-w-2xl mx-auto leading-relaxed">
          Nơi gìn giữ những tác phẩm Việt phục remix do chính bạn kiến tạo. Dễ dàng xem lại phiếu phối đồ, tải ảnh độ phân giải cao hoặc đưa trở lại Canvas để phát triển tiếp.
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 max-w-xl mx-auto">
          <div className="p-3.5 bg-white rounded-2xl border border-[#E9DFD1] shadow-xs">
            <span className="text-[11px] text-[#7B6858] block">Lookbook đã lưu</span>
            <span className="font-heritage text-xl sm:text-2xl font-bold text-[#800E13]">
              {stats.total}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#E9DFD1] shadow-xs">
            <span className="text-[11px] text-[#7B6858] block">Hài hòa trung bình</span>
            <span className="font-heritage text-xl sm:text-2xl font-bold text-[#2C6E49]">
              {stats.avgScore}/100
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#E9DFD1] shadow-xs overflow-hidden">
            <span className="text-[11px] text-[#7B6858] block">Áo yêu thích nhất</span>
            <span className="font-heritage text-xs sm:text-sm font-bold text-[#2C241D] truncate block" title={stats.topCostume}>
              {stats.topCostume}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Bulk Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E9DFD1] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786454]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên lookbook, áo cổ truyền, trang phục phối hoặc dịp mặc..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF6F0] border border-[#DFD5C6] rounded-xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/20 focus:border-[#800E13] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#786454] hover:text-[#2C241D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-[#FAF6F0] border border-[#DFD5C6] rounded-xl text-xs font-medium text-[#4A3E35] focus:outline-none focus:ring-2 focus:ring-[#800E13]/20"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="score">Điểm hài hòa cao nhất</option>
            </select>

            {lookbookHistory.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl font-medium transition-colors"
                title="Xóa tất cả lookbook trong lịch sử"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Occasion Filter Chips */}
        {availableOccasions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#F0E6D8]">
            <span className="text-[11px] font-semibold text-[#8C7A6B] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Dịp mặc:</span>
            </span>
            <button
              onClick={() => setSelectedOccasionFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedOccasionFilter === 'all'
                  ? 'bg-[#800E13] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#55473D] hover:bg-[#EFE5D5]'
              }`}
            >
              Tất cả ({lookbookHistory.length})
            </button>
            {availableOccasions.map((occ) => {
              const count = lookbookHistory.filter((i) => i.occasion === occ).length;
              return (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasionFilter(occ)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedOccasionFilter === occ
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'bg-[#FAF6F0] text-[#55473D] hover:bg-[#EFE5D5]'
                  }`}
                >
                  {occ} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Gallery of Saved Lookbooks */}
      {filteredLookbooks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E9DFD1] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#800E13] border border-[#E9DFD1] flex items-center justify-center mx-auto shadow-xs">
            <History className="w-8 h-8 opacity-75" />
          </div>
          <div>
            <h3 className="font-heritage text-lg font-bold text-[#2C241D]">
              {searchQuery || selectedOccasionFilter !== 'all'
                ? 'Không tìm thấy lookbook phù hợp'
                : 'Chưa có lookbook nào được lưu'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7B6858] max-w-md mx-auto mt-1">
              {searchQuery || selectedOccasionFilter !== 'all'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm "Tất cả" để xem toàn bộ danh sách.'
                : 'Hãy bắt đầu phối một bộ trang phục di sản ưng ý trên Canvas hoặc mục Phối Đồ, sau đó xuất Lookbook để lưu lại tại đây.'}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('mix');
              setMixSubflow('free');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-[#800E13]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lookbook Mới Ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLookbooks.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E9DFD1] shadow-xs hover:shadow-xl hover:border-[#D4A373] transition-all duration-300"
            >
              {/* Card Photo Header */}
              <div className="relative h-64 w-full overflow-hidden bg-stone-900">
                <img
                  src={item.compositeImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E9C46A] text-[#2C241D] shadow-xs">
                    Điểm hài hòa: {item.harmonyScore}/100
                  </span>

                  {/* Red Official Seal Stamp (Triện son) */}
                  <div className="border border-[#9B2226] bg-[#9B2226]/90 text-white px-2 py-0.5 rounded text-center font-heritage text-[9px] font-bold shadow-xs">
                    TRANG PHỤC VIỆT
                  </div>
                </div>

                {/* Bottom Overlay Title & Date */}
                <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.createdAt}</span>
                    </span>
                    <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-stone-200">
                      {item.occasion}
                    </span>
                  </div>
                  <h3 className="font-heritage text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-[#E9C46A] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Body: Garments & Color Specs */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F0E6D8]">
                    <span className="text-[#8C7A6B] font-medium">Cổ phục:</span>
                    <span className="font-semibold text-[#2C241D] text-right">
                      {item.costumeName}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F0E6D8]">
                    <span className="text-[#8C7A6B] font-medium">Phối cùng:</span>
                    <span className="font-semibold text-[#2C241D] text-right">
                      {item.modernGarmentName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F0E6D8]">
                    <span className="text-[#8C7A6B] font-medium">Bản hòa sắc:</span>
                    <span className="text-[#800E13] font-semibold text-right">
                      {item.traditionalColorName} × {item.modernColorName}
                    </span>
                  </div>

                  {item.accessoryNames && item.accessoryNames.length > 0 && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#8C7A6B] font-medium shrink-0">Phụ kiện:</span>
                      <span className="text-[#5C4D3C] text-right line-clamp-1">
                        {item.accessoryNames.join(', ')}
                      </span>
                    </div>
                  )}

                  {item.recipientProfile && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#800E13] shrink-0" />
                      <span className="truncate">
                        Phối cho: <b>{item.recipientProfile.name}</b> ({item.recipientProfile.relationship || 'Người thân'})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Grid */}
                <div className="pt-2 border-t border-[#F0E6D8] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* View full Lookbook */}
                    <button
                      onClick={() => setActivePreviewLookbook(item)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF5EE] hover:bg-[#F0E6D8] text-[#800E13] border border-[#DFD1BD] rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem & Tải ảnh</span>
                    </button>

                    {/* Restore to Canvas to keep mixing */}
                    <button
                      onClick={() => restoreLookbookToCanvas(item)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                      title="Mở lại toàn bộ trang phục này vào Canvas để phối tiếp"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Phối tiếp trên Canvas</span>
                    </button>
                  </div>

                  {/* Secondary actions: Rename & Delete */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setRenamingLookbook({ id: item.id, title: item.title })}
                      className="inline-flex items-center gap-1 text-[11px] text-[#7B6858] hover:text-[#2C241D] transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Đổi tên</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Full Lookbook Preview & Official Export Frame */}
      {activePreviewLookbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative flex flex-col w-full max-w-2xl bg-[#FBF8F3] rounded-3xl shadow-2xl overflow-hidden border-2 border-[#D4A373]/60 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DFD1] bg-[#F4EDE2]/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9B2226]" />
                <h3 className="font-heritage text-base sm:text-lg font-bold text-[#2C241D]">
                  Phiếu Phối Đồ · {activePreviewLookbook.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewLookbook(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lookbook Printable Body */}
            <div className="relative p-6 sm:p-8 bg-[#FFFDF9] overflow-hidden">
              <DongSonWatermark className="top-10 -right-20 w-80 h-80 text-[#9B2226]" opacity={0.04} />

              <div className="relative border border-[#DFD1BD] rounded-2xl p-6 bg-radial from-white via-[#FCFAF6] to-[#F8F4EC] shadow-inner">
                {/* Brand Seal Header */}
                <div className="flex items-start justify-between border-b border-[#EAE0D3] pb-4">
                  <div>
                    <NepLavisLogo size="sm" showSubtext={true} />
                    <p className="text-[10px] text-[#786454] uppercase tracking-widest mt-1">
                      Hồ Sơ Phong Cách Việt Phục Nếp
                    </p>
                  </div>
                  <div className="border-2 border-[#9B2226] text-[#9B2226] px-2.5 py-1 rounded text-center rotate-3 font-heritage text-[11px] font-bold shadow-xs">
                    <div>CHUẨN MỰC</div>
                    <div className="text-[9px] border-t border-[#9B2226]/40 mt-0.5 pt-0.5">TRANG PHỤC VIỆT</div>
                  </div>
                </div>

                {/* Grid Layout: Visual + Specifications */}
                <div className="grid sm:grid-cols-2 gap-6 mt-6 items-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#E9DFD1] bg-stone-900 aspect-3/4">
                    <img
                      src={activePreviewLookbook.compositeImage}
                      alt={activePreviewLookbook.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E9C46A] block">
                        {activePreviewLookbook.recipientProfile 
                          ? `Phối cho: ${activePreviewLookbook.recipientProfile.name} (${activePreviewLookbook.recipientProfile.relationship || 'Người thân'})`
                          : `Người mặc: ${userProfile?.name || 'Khách Quý Nếp'}`}
                      </span>
                      <span className="font-heritage text-sm font-bold">
                        {activePreviewLookbook.title}
                      </span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-3">
                    {activePreviewLookbook.recipientProfile && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#800E13]" />
                          <span>Hồ sơ may đo người thân:</span>
                        </span>
                        <p className="font-bold text-[#800E13]">
                          {activePreviewLookbook.recipientProfile.name} ({activePreviewLookbook.recipientProfile.relationship || 'Người thân'})
                        </p>
                        <p className="text-[11px] text-[#6C584C]">
                          {activePreviewLookbook.recipientProfile.age ? `${activePreviewLookbook.recipientProfile.age} tuổi · ` : ''}
                          Cao {activePreviewLookbook.recipientProfile.height} cm · Nặng {activePreviewLookbook.recipientProfile.weight} kg
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Cổ phục nền tảng
                      </span>
                      <h4 className="font-heritage text-base font-bold text-[#2C241D]">
                        {activePreviewLookbook.costumeName}
                      </h4>
                      <p className="text-xs text-[#786454]">
                        {activePreviewLookbook.costumeEra}
                      </p>
                    </div>

                    <div className="border-t border-[#EAE0D3] pt-2">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Trang phục đương đại
                      </span>
                      <p className="text-xs font-semibold text-[#2C241D]">
                        {activePreviewLookbook.modernGarmentName}
                      </p>
                    </div>

                    <div className="border-t border-[#EAE0D3] pt-2">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Hòa sắc ngũ hành
                      </span>
                      <p className="text-xs font-semibold text-[#800E13]">
                        {activePreviewLookbook.traditionalColorName} × {activePreviewLookbook.modernColorName}
                      </p>
                    </div>

                    <div className="border-t border-[#EAE0D3] pt-2">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Dịp xuất hiện gợi ý
                      </span>
                      <p className="text-xs text-[#55473D]">
                        {activePreviewLookbook.occasion}
                      </p>
                    </div>

                    <div className="border-t border-[#EAE0D3] pt-2">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        Chứng nhận văn hóa
                      </span>
                      <p className="text-[11px] text-[#2C6E49] font-medium leading-relaxed">
                        ✓ Đạt chuẩn mực phom dáng trang phục Đại Việt; kết hợp văn minh, tôn vinh khí chất người Việt đương đại.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vietnam Sovereignty Map Footer */}
                <div className="mt-6 pt-4 border-t border-[#EAE0D3] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8F3EC]/70 p-3.5 rounded-xl">
                  <div className="text-center sm:text-left">
                    <span className="text-[11px] font-bold text-[#800E13] uppercase tracking-wider block">
                      Bản Đồ Non Sông Gấm Vóc
                    </span>
                    <p className="text-[10px] text-[#6C584C]">
                      Toàn vẹn bờ cõi cùng hai quần đảo Hoàng Sa và Trường Sa
                    </p>
                  </div>
                  <div className="shrink-0">
                    <VietnamMapWithIslands className="w-28 h-36" showLabels={true} isCompact={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#F4EDE2] border-t border-[#E9DFD1]">
              <span className="text-xs text-[#786454]">
                {downloadSuccess ? '✓ Đã tải ảnh xuống!' : copiedShare ? '✓ Đã sao chép liên kết!' : `Lưu trữ ngày ${activePreviewLookbook.createdAt}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareLookbook}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-100 text-[#3E342B] border border-[#D8C7B3] rounded-xl text-xs font-medium transition-colors"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'Đã sao chép' : 'Chia sẻ'}</span>
                </button>

                <button
                  onClick={() => handleDownloadImage(activePreviewLookbook)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-[#800E13]/20"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadSuccess ? 'Đã tải thành công!' : 'Tải Lookbook (PNG)'}</span>
                </button>

                <button
                  onClick={() => {
                    restoreLookbookToCanvas(activePreviewLookbook);
                    setActivePreviewLookbook(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1D3557] hover:bg-[#15253D] text-white rounded-xl text-xs font-medium transition-all shadow-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Mở trên Canvas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Rename Lookbook Modal */}
      {renamingLookbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E9DFD1] shadow-2xl space-y-4">
            <h3 className="font-heritage text-base font-bold text-[#2C241D]">
              Đổi Tên Lookbook
            </h3>
            <input
              type="text"
              value={renamingLookbook.title}
              onChange={(e) => setRenamingLookbook({ ...renamingLookbook, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#DFD5C6] rounded-xl text-sm text-[#2C241D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/20 focus:border-[#800E13]"
              placeholder="Nhập tên mới cho Lookbook..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRenamingLookbook(null)}
                className="px-4 py-2 text-xs font-medium text-[#6C584C] hover:bg-stone-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 text-xs font-semibold bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl shadow-xs"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Item Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E9DFD1] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heritage text-base font-bold text-[#2C241D]">
                Xác Nhận Xóa Lookbook
              </h3>
              <p className="text-xs text-[#7B6858] mt-1">
                Bạn có chắc chắn muốn xóa lookbook này khỏi lịch sử lưu trữ?
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-[#6C584C] hover:bg-stone-100 rounded-xl"
              >
                Giữ Lại
              </button>
              <button
                onClick={() => {
                  deleteLookbook(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Clear All History Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E9DFD1] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heritage text-base font-bold text-[#2C241D]">
                Xóa Toàn Bộ Lịch Sử?
              </h3>
              <p className="text-xs text-[#7B6858] mt-1">
                Thao tác này sẽ xóa tất cả {lookbookHistory.length} lookbook đã lưu trong bộ nhớ máy.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-[#6C584C] hover:bg-stone-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  clearLookbookHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Xóa Hết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
