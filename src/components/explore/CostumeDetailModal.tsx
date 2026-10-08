import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TraditionalCostume } from '../../types';
import { useApp } from '../../context/AppContext';
import { CostumeImage } from '../common/CostumeImage';
import { NepLavisLogo } from '../common/NepLavisLogo';
import { searchGroundedCostumeHistory, GroundingSearchResult } from '../../services/groundingService';
import { getAccessoriesForCostume, TraditionalAccessory } from '../../data/accessoriesData';
import { AccessoryImage } from '../common/AccessoryImage';
import { AccessoryDetailModal } from './AccessoryDetailModal';
import { 
  X, 
  Sparkles, 
  Bookmark, 
  Share2, 
  Check, 
  ExternalLink, 
  Search, 
  Loader2, 
  Layers, 
  Calendar, 
  ArrowRight,
  Compass,
  Eye,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface CostumeDetailModalProps {
  costume: TraditionalCostume;
  onClose: () => void;
}

export const CostumeDetailModal: React.FC<CostumeDetailModalProps> = ({
  costume,
  onClose
}) => {
  const { selectCostumeForMix } = useApp();

  const matchingAccessories = getAccessoriesForCostume(costume.id);

  // Phân loại phụ kiện theo giới tính:
  const femaleAccessories = useMemo(
    () => matchingAccessories.filter(a => a.gender === 'female' || a.gender === 'both'),
    [matchingAccessories]
  );
  const maleAccessories = useMemo(
    () => matchingAccessories.filter(a => a.gender === 'male' || a.gender === 'both'),
    [matchingAccessories]
  );

  const hasMaleAccessories = useMemo(
    () => matchingAccessories.some(a => a.gender === 'male'),
    [matchingAccessories]
  );
  const hasFemaleAccessories = useMemo(
    () => matchingAccessories.some(a => a.gender === 'female'),
    [matchingAccessories]
  );

  // "với những món chỉ dành cho nữ thì không cần chia"
  // Trang phục cả Nam và Nữ đều mặc được (unisex như Áo Đối Khâm, Áo Bà Ba, Áo Ngũ Thân, Áo Tấc, Áo Giao Lĩnh, Áo Viên Lĩnh)
  // hoặc trang phục có cả phụ kiện nam và nữ (như Áo Nhật Bình) -> Luôn chia tabs Nam / Nữ.
  // Những trang phục thuần túy chỉ dành cho Nữ (như Áo Yếm, Áo Tứ Thân, Áo Dài Le Mur) -> Không cần chia tabs.
  const isCostumeUnisex = costume.gender === 'unisex' || costume.genderSupport === 'both';
  const shouldShowGenderTabs = isCostumeUnisex || (hasMaleAccessories && hasFemaleAccessories);

  // Tab giới tính phụ kiện: 'female' | 'male' | 'all'
  const [accessoryGenderTab, setAccessoryGenderTab] = useState<'female' | 'male' | 'all'>(() => {
    if (costume.gender === 'male') return 'male';
    if (costume.gender === 'female') return 'female';
    return 'female';
  });

  // Danh sách phụ kiện hiển thị theo tab
  const displayedAccessories = useMemo(() => {
    if (!shouldShowGenderTabs) {
      return matchingAccessories;
    }
    if (accessoryGenderTab === 'female') {
      return femaleAccessories;
    }
    if (accessoryGenderTab === 'male') {
      return maleAccessories;
    }
    return matchingAccessories;
  }, [shouldShowGenderTabs, accessoryGenderTab, matchingAccessories, femaleAccessories, maleAccessories]);

  // Selected accessory to view full popup details
  const [selectedAccessory, setSelectedAccessory] = useState<TraditionalAccessory | null>(null);

  // Active gender view for unisex attires
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(() => {
    if (costume.gender === 'male') return 'male';
    return 'female';
  });

  // Angle toggle: Full view ('front') vs Collar / Top Detail ('detail')
  const [viewAngle, setViewAngle] = useState<'front' | 'detail'>('front');

  // Custom photo replacement state (e.g. uploaded couple shoot or user photo)
  const [customImage, setCustomImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`nep_custom_img_${costume.id}`);
    } catch {
      return null;
    }
  });
  // Grounding state
  const [groundingResult, setGroundingResult] = useState<GroundingSearchResult | null>(null);
  const [isGroundingLoading, setIsGroundingLoading] = useState<boolean>(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState<boolean>(false);

  // Bookmark & Share interaction states
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`nep_fav_${costume.id}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle bookmark toggle
  const toggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      localStorage.setItem(`nep_fav_${costume.id}`, String(next));
    } catch {
      // ignore storage errors
    }
  };

  // Handle share link
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Handle Action: "Dùng bộ này để phối đồ"
  const handleUseForMix = () => {
    selectCostumeForMix(costume);
    onClose();
  };

  // Run Google Search Grounding for academic research
  const handleRunGrounding = async () => {
    setIsGroundingOpen(true);
    if (groundingResult || isGroundingLoading) return;
    setIsGroundingLoading(true);
    try {
      const res = await searchGroundedCostumeHistory('', costume.name);
      setGroundingResult(res);
    } finally {
      setIsGroundingLoading(false);
    }
  };

  // Resolve active image based on gender selection and view angle
  const resolvedImage = (() => {
    if (customImage) return customImage;

    if (viewAngle === 'detail') {
      if (selectedGender === 'male' && costume.maleTopImage) return costume.maleTopImage;
      if (selectedGender === 'female' && costume.femaleTopImage) return costume.femaleTopImage;
      if (costume.topImage) return costume.topImage;
    }

    if (selectedGender === 'male' && costume.maleFrontImage) return costume.maleFrontImage;
    if (selectedGender === 'female' && costume.femaleFrontImage) return costume.femaleFrontImage;
    return costume.frontImage;
  })();

  // Whether this costume has a close-up detail or distinct back image available
  const hasBackImage = Boolean(costume.backImage && costume.backImage !== costume.frontImage);
  const hasDetailImage = Boolean(
    (costume.topImage && costume.topImage !== costume.frontImage) || 
    (selectedGender === 'male' && costume.maleTopImage && costume.maleTopImage !== costume.frontImage) || 
    (selectedGender === 'female' && costume.femaleTopImage && costume.femaleTopImage !== costume.frontImage)
  );

  // Is Unisex with both gender variants
  const isUnisex = costume.gender === 'unisex' || costume.genderSupport === 'both';

  // Smart derivation of anatomy features based on garment name & tailoring tradition
  const anatomyData = (() => {
    const nameLower = costume.name.toLowerCase();

    // 1. Cổ áo
    let collar = 'Cổ đứng vuông vắn (Lập lĩnh) cao 2 - 3cm, dựng ngay ngắn kín đáo theo điển lễ.';
    if (nameLower.includes('giao lĩnh')) {
      collar = 'Giao lĩnh (Cổ chéo chữ V), hai vạt đan cài uyển chuyển trước ngực đặc trưng thời Lê - Nguyễn.';
    } else if (nameLower.includes('viên lĩnh')) {
      collar = 'Viên lĩnh (Cổ tròn), viền tròn khép kín mềm mại, thường phối cùng trung đơn lót trắng.';
    } else if (nameLower.includes('nhật bình')) {
      collar = 'Cổ vuông đối khâm khoét rộng, bản nẹp nhật bình viền dải hoa văn thêu ngũ sắc lộng lẫy.';
    } else if (nameLower.includes('yếm')) {
      collar = 'Cổ yếm tròn hoặc xẻ nhạn chữ V, buộc dây sau gáy tôn nét đài các thắt đáy lưng ong.';
    }

    // 2. Vạt áo
    let flap = 'Nguyên tắc Hữu nhậm: Vạt phải đè lên vạt trái theo quy phạm văn hóa y phục truyền thống Việt.';
    if (nameLower.includes('tứ thân')) {
      flap = 'Bốn vạt (2 thân sau may sống lưng, 2 thân trước thả dài buộc vạt trước bụng tượng trưng tứ thân phụ mẫu).';
    } else if (nameLower.includes('ngũ thân') || nameLower.includes('tấc')) {
      flap = 'Năm thân kinh điển: Vạt cả che vạt con bên trong, tượng trưng cho đạo phụ mẫu che chở con cái.';
    }

    // 3. Hàng khuy
    let buttons = 'Khuy ngũ thường: 5 khuy cúc (đồng/ngọc/vải) tượng trưng cho Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).';
    if (nameLower.includes('yếm')) {
      buttons = 'Dây buộc lụa tơ tằm mềm mại sau gáy và quanh eo, điều chỉnh ôm khít cơ thể.';
    } else if (nameLower.includes('nhật bình')) {
      buttons = 'Dải ngũ hành và khuy đồng cài dải kết ngọc trân quý phía trước nẹp cổ.';
    }

    // 4. Ống tay
    let sleeves = 'Tay chẽn ôm thon dài từ bắp tay đến cổ tay, tạo phom dáng đĩnh đạc và tiện hoạt động.';
    if (nameLower.includes('tấc') || nameLower.includes('thụng')) {
      sleeves = 'Tay thụng dài rộng 40 - 50cm buông rủ uyển chuyển, biểu trưng cho phong thái ung dung, lễ nghi.';
    } else if (nameLower.includes('viên lĩnh') || nameLower.includes('giao lĩnh')) {
      sleeves = 'Tay áo thụng rộng hoặc tay chẽn tùy phẩm phục và lễ tiết triều đình.';
    }

    return { collar, flap, buttons, sleeves };
  })();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-200 select-none md:select-auto"
      onClick={onClose}
    >
      {/* Modal Shell - Instagram Post Lightbox 2-Column */}
      <div 
        className="relative w-full max-w-6xl h-full md:h-[88vh] max-h-[920px] bg-[#FBF8F3] rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-0 md:border border-[#E9DFD1]/70 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button for Mobile and Desktop */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ chi tiết"
          className="absolute top-3 right-3 md:top-4 md:right-4 z-40 p-2 md:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white md:bg-white/90 md:hover:bg-white md:text-[#2C241D] md:border md:border-[#DFD1BD] backdrop-blur-md transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* 1. LEFT COLUMN: MEDIA SHOWCASE (52% - 55% DESKTOP WIDTH) */}
        {/* ======================================================== */}
        <div className="relative w-full md:w-[52%] lg:w-[55%] h-[42vh] md:h-full bg-[#181310] flex items-center justify-center overflow-hidden shrink-0">
          {/* Subtle Đông Sơn Sun/Drum Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 mix-blend-screen pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-[120%] h-[120%] text-[#E6C280] animate-spin-slow">
              <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <polygon points="200,150 212,188 250,200 212,212 200,250 188,212 150,200 188,188" fill="currentColor" opacity="0.6" />
            </svg>
          </div>



          {/* High-Resolution Costume Image */}
          <div className="relative w-full h-full flex items-center justify-center p-3 md:p-8">
            <CostumeImage
              src={resolvedImage}
              alt={costume.name}
              className="w-full h-full object-contain filter drop-shadow-2xl transition-all duration-300 pointer-events-none"
            />
          </div>

          {/* Sub-view angle toggles (Thumbnail pills at bottom-left) */}
          {hasDetailImage && (
            <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-20 flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
              <button
                type="button"
                onClick={() => setViewAngle('front')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                  viewAngle === 'front'
                    ? 'bg-[#800E13] text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Toàn cảnh</span>
              </button>
              <button
                type="button"
                onClick={() => setViewAngle('detail')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                  viewAngle === 'detail'
                    ? 'bg-[#800E13] text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Cận cảnh nẹp cổ</span>
              </button>
            </div>
          )}


        </div>

        {/* ======================================================== */}
        {/* 2. RIGHT COLUMN: HERITAGE FEED & ACTIONS (48% - 45%)     */}
        {/* ======================================================== */}
        <div className="w-full md:w-[48%] lg:w-[45%] h-[58vh] md:h-full flex flex-col bg-[#FBF8F3] border-t md:border-t-0 md:border-l border-[#E9DFD1] overflow-hidden">
          
          {/* A. Header (Pinned at Top - Instagram Profile Style) */}
          <header className="p-4 md:p-5 border-b border-[#E9DFD1] bg-[#FAF5EE]/95 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo Nếp Thư Pháp Lavis (đồng bộ chuẩn xác với giao diện chính) */}
              <div className="flex items-center justify-center px-2 py-1 rounded-xl bg-[#F5ECE1] border border-[#DFD1BD] shadow-2xs shrink-0">
                <NepLavisLogo size="xs" theme="primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base md:text-lg font-bold font-serif text-[#2C241D] truncate leading-tight">
                    {costume.name}
                  </h2>
                  <CheckCircle2 className="w-4 h-4 text-[#800E13] shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#786454] mt-0.5 truncate">
                  <span className="font-semibold text-[#800E13]">{costume.dynasty}</span>
                  <span>•</span>
                  <span>{costume.region || 'Toàn quốc'}</span>
                  <span>•</span>
                  <span className="text-[#8C7A6B]">{costume.era}</span>
                </div>
              </div>
            </div>

            {/* Bookmark & Favorite action in header */}
            <div className="flex items-center gap-1 shrink-0 pr-8 md:pr-0">
              <button
                type="button"
                onClick={toggleBookmark}
                title={isBookmarked ? 'Đã lưu vào bộ sưu tập' : 'Lưu trang phục này'}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-[#800E13] border-[#800E13] text-white shadow-xs'
                    : 'bg-white border-[#DFD1BD] text-[#6C584C] hover:text-[#800E13] hover:border-[#800E13]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </header>

          {/* B. Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 customized-scrollbar">
            
            {/* 1. Tóm Tắt & Điển Chế Lịch Sử */}
            <section className="space-y-3">
              {/* Short Quote */}
              <div className="p-3.5 rounded-2xl bg-[#F4EDE2]/80 border border-[#E3D6C5] text-xs sm:text-sm text-[#4A3E35] italic font-serif leading-relaxed">
                "{costume.shortDesc}"
              </div>

              {/* History Story */}
              <div className="p-4 rounded-2xl bg-white border border-[#E7DAC8] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#800E13]">
                  <Compass className="w-4 h-4 text-[#800E13]" />
                  <span>Bối Cảnh Lịch Sử & Điển Chế Triều Đình</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3E342B] leading-relaxed text-justify">
                  {costume.historyStory}
                </p>
                {costume.culturalNotes && (
                  <div className="pt-2 mt-2 border-t border-[#F2ECE3] text-[11px] text-[#7A6655] leading-normal flex items-start gap-1.5">
                    <span className="font-semibold text-[#800E13] shrink-0">Lưu ý điển chế:</span>
                    <span>{costume.culturalNotes}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Giải Phẫu Cấu Trúc Y Phục (Anatomy & Tailoring Structure) */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2C241D]">
                  <Layers className="w-4 h-4 text-[#800E13]" />
                  <span>Giải Phẫu Cấu Trúc Y Phục</span>
                </div>
                <span className="text-[10px] text-[#8C7A6B] font-medium">Quy chuẩn may đo</span>
              </div>

              {/* Mini Grid 4 Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Cổ áo */}
                <div className="p-3 rounded-xl bg-white border border-[#E5DACD] shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#800E13] block mb-1">
                      1. Cổ Áo
                    </span>
                    <p className="text-xs text-[#3E342B] leading-relaxed">
                      {anatomyData.collar}
                    </p>
                  </div>
                </div>

                {/* 2. Vạt áo */}
                <div className="p-3 rounded-xl bg-white border border-[#E5DACD] shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#800E13] block mb-1">
                      2. Vạt Áo
                    </span>
                    <p className="text-xs text-[#3E342B] leading-relaxed">
                      {anatomyData.flap}
                    </p>
                  </div>
                </div>

                {/* 3. Hàng khuy */}
                <div className="p-3 rounded-xl bg-white border border-[#E5DACD] shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#800E13] block mb-1">
                      3. Hàng Khuy
                    </span>
                    <p className="text-xs text-[#3E342B] leading-relaxed">
                      {anatomyData.buttons}
                    </p>
                  </div>
                </div>

                {/* 4. Ống tay */}
                <div className="p-3 rounded-xl bg-white border border-[#E5DACD] shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#800E13] block mb-1">
                      4. Ống Tay
                    </span>
                    <p className="text-xs text-[#3E342B] leading-relaxed">
                      {anatomyData.sleeves}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structure components tags */}
              {costume.structureComponents && costume.structureComponents.length > 0 && (
                <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E7DAC8] mt-2">
                  <span className="text-[11px] font-semibold text-[#6C584C] block mb-1.5">
                    Các lớp cấu thành trang phục:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {costume.structureComponents.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white border border-[#DFD1BD] text-[11px] text-[#4A3E35] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 3. Dịp Mặc Chuẩn Mực (Occasions) */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2C241D]">
                <Calendar className="w-4 h-4 text-[#800E13]" />
                <span>Dịp Mặc Chuẩn Mực & Không Gian Lễ Tiết</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {costume.suitableOccasions.map((occ, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#DFD1BD] text-xs font-medium text-[#4A3E35] shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800E13]" />
                    <span>{occ}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* 4. PHỤ KIỆN ĐI CÙNG ĐẶC TRƯNG (ĐIỂN CHẾ CỔ TRUYỀN) */}
            {matchingAccessories.length > 0 && (
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2C241D]">
                    <Sparkles className="w-4 h-4 text-[#800E13]" />
                    <span>Phụ Kiện Đi Cùng Đặc Trưng ({matchingAccessories.length} món)</span>
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] font-medium">Bấm vào để xem ảnh & điển chế</span>
                </div>

                {/* Tabs phân chia Nam / Nữ: Chỉ hiển thị khi có phụ kiện của cả hai giới (ví dụ Áo Nhật Bình). 
                    Những món/trang phục chỉ dành cho nữ (như Áo Yếm) thì không cần chia tabs */}
                {shouldShowGenderTabs && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#E8DAC8]">
                    <div className="flex items-center gap-1 p-0.5 bg-[#F3E9DD] rounded-xl text-xs font-bold w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setAccessoryGenderTab('female')}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          accessoryGenderTab === 'female'
                            ? 'bg-[#800E13] text-white shadow-2xs font-bold'
                            : 'text-[#6C584C] hover:text-[#800E13]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>Dành cho Nữ ({femaleAccessories.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccessoryGenderTab('male')}
                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          accessoryGenderTab === 'male'
                            ? 'bg-[#800E13] text-white shadow-2xs font-bold'
                            : 'text-[#6C584C] hover:text-[#800E13]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Dành cho Nam ({maleAccessories.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccessoryGenderTab('all')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          accessoryGenderTab === 'all'
                            ? 'bg-[#800E13] text-white shadow-2xs font-bold'
                            : 'text-[#6C584C] hover:text-[#800E13]'
                        }`}
                      >
                        <span>Tất cả ({matchingAccessories.length})</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách mỗi món là 1 chiều ngang, hiển thị trọn vẹn tên món phụ kiện */}
                <div className="flex flex-col space-y-2.5">
                  {displayedAccessories.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccessory(acc)}
                      className="w-full p-3 rounded-2xl bg-white border border-[#E7DAC8] hover:border-[#800E13] hover:shadow-md shadow-xs flex items-center gap-3.5 group transition-all duration-200 cursor-pointer"
                      title={`Bấm để xem ảnh và thông tin chi tiết của ${acc.name}`}
                    >
                      {/* Ảnh minh họa nhỏ gọn, sắc nét */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF6F0] p-1.5 border border-[#EAE0D3] shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <AccessoryImage
                          src={acc.image}
                          fallbackSrc={acc.image}
                          alt={acc.name}
                          className="w-full h-full object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Thông tin 1 chiều ngang, hiện HẾT TÊN không bị cắt ngắn */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13]">
                            {acc.categoryLabel}
                          </span>

                          {/* Chỉ rõ món dành cho Nam, Nữ hay Cả hai */}
                          {acc.gender === 'female' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 font-bold border border-rose-200 shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Dành cho Nữ
                            </span>
                          )}
                          {acc.gender === 'male' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200 shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Dành cho Nam
                            </span>
                          )}
                          {acc.gender === 'both' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Cả Nam &amp; Nữ
                            </span>
                          )}

                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-900 font-semibold shrink-0">
                            {acc.badge}
                          </span>
                          {acc.region && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 font-medium shrink-0">
                              {acc.region}
                            </span>
                          )}
                        </div>

                        {/* Hiện HẾT TÊN món phụ kiện (không bị cắt ngắn hay truncate) */}
                        <h4 className="font-heritage text-sm sm:text-base font-bold text-[#2C241D] leading-snug group-hover:text-[#800E13] transition-colors">
                          {acc.name}
                        </h4>

                        <p className="text-xs text-[#6C584C] mt-0.5 line-clamp-1">
                          {acc.culturalMeaning || acc.wearingGuide}
                        </p>
                      </div>

                      {/* Mũi tên chỉ dẫn bấm xem ảnh và thông tin */}
                      <div className="shrink-0 flex items-center text-[#9B2226] group-hover:translate-x-1 transition-transform pl-1">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Khảo Cứu Google Search Grounding */}
            <section className="p-4 rounded-2xl bg-white border border-[#E5DACD] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#800E13]" />
                  <span className="text-xs font-bold text-[#2C241D] uppercase tracking-wide">
                    Khảo Cứu Học Thuật & Bảo Tàng
                  </span>
                </div>
                {!isGroundingOpen && (
                  <button
                    type="button"
                    onClick={handleRunGrounding}
                    className="px-3 py-1 rounded-lg bg-[#FAF5EE] hover:bg-[#F2E8DC] text-[#800E13] border border-[#DFD1BD] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tra cứu ngay
                  </button>
                )}
              </div>

              {isGroundingLoading && (
                <div className="py-4 text-center space-y-2">
                  <Loader2 className="w-5 h-5 text-[#800E13] animate-spin mx-auto" />
                  <p className="text-xs text-[#786454]">
                    Đang kết nối Google Search trích xuất tư liệu bảo tàng về {costume.name}...
                  </p>
                </div>
              )}

              {groundingResult && !isGroundingLoading && (
                <div className="space-y-3">
                  <div className="text-xs text-[#3E342B] leading-relaxed whitespace-pre-line p-3 rounded-xl bg-[#FAF6F0] border border-[#EAE0D3]">
                    {groundingResult.text}
                  </div>

                  {groundingResult.sources && groundingResult.sources.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#800E13] block">
                        Nguồn tài liệu khảo cứu xác thực:
                      </span>
                      <div className="space-y-1">
                        {groundingResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-[#FBF8F3] border border-[#E7DAC8] hover:border-[#800E13] text-xs text-[#2C241D] hover:text-[#800E13] transition-colors"
                          >
                            <span className="truncate pr-2">{src.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 5. Mẹo Remix Đương Đại */}
            {costume.modernRemixTips && (
              <section className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9F2] to-[#FAF3E8] border border-[#E8DAC8] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#800E13]">
                  <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                  <span>Mẹo Phối Đồ Remix Đương Đại</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4E4034] leading-relaxed">
                  {costume.modernRemixTips}
                </p>
              </section>
            )}
          </div>

          {/* C. Footer Actions (Pinned at Bottom) */}
          <footer className="border-t border-[#E9DFD1] p-3.5 md:p-4 bg-[#FAF5EE]/95 backdrop-blur-md flex items-center gap-2.5 shrink-0 sticky bottom-0">
            {/* Quick Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Sao chép đường dẫn chia sẻ"
              className="p-3 rounded-xl border border-[#DFD1BD] bg-white hover:bg-[#F4EDE2] text-[#4E4034] hover:text-[#2C241D] transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Primary Action Button: "Dùng bộ này để phối đồ" */}
            <button
              type="button"
              onClick={handleUseForMix}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#800E13] via-[#9B2226] to-[#800E13] hover:from-[#6B0B10] hover:to-[#800E13] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#800E13]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#E9C46A]" />
              <span>Dùng bộ này để phối đồ</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </footer>
        </div>
      </div>

      {/* Cửa sổ hiển thị ảnh & thông tin chi tiết của món phụ kiện khi người dùng bấm vào */}
      {selectedAccessory && (
        <AccessoryDetailModal
          accessory={selectedAccessory}
          onClose={() => setSelectedAccessory(null)}
          onSelectForMix={() => {
            setSelectedAccessory(null);
            onClose();
            selectCostumeForMix(costume);
          }}
        />
      )}
    </div>
  );
};

export default CostumeDetailModal;
