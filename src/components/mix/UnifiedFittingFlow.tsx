import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TraditionalCostume, UserWardrobeItem } from '../../types';
import { OFFICIAL_13_COSTUMES } from '../../data/costumesData';
import { OFFICIAL_TRADITIONAL_ACCESSORIES, TraditionalAccessory, getAccessoriesForCostume } from '../../data/accessoriesData';
import { AccessoryImage } from '../common/AccessoryImage';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { CameraFlowModal } from './CameraFlowModal';
import { LookbookExportModal } from './LookbookExportModal';
import { OutfitCritiqueSection } from '../critique/OutfitCritiqueSection';
import { CostumeImage } from '../common/CostumeImage';
import { composeEditorialFittingImage } from '../../utils/fittingCanvasComposer';
import { QuotaExceededNoticeModal } from './QuotaExceededNoticeModal';
import { getSavedGeminiApiKey, saveGeminiApiKey } from '../../utils/apiKeyStorage';
import { 
  Sparkles, 
  Send, 
  Camera, 
  ArrowLeft, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  Wand2, 
  History, 
  Undo2, 
  CheckCircle2, 
  Layers, 
  AlertCircle,
  Loader2,
  FileText,
  ShoppingBag,
  Share2,
  RefreshCw,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Upload,
  X,
  SlidersHorizontal,
  User,
  Info,
  Palette,
  Download,
  Award,
  Eye,
  CheckCircle,
  Clock,
  Key,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export interface GeminiFittingOutput {
  critique: string;
  harmonyScore: number;
  heritageAnalysis: string;
  accessoryVerdict: string;
  pros?: {
    title: string;
    points: string[];
  };
  cons?: {
    title: string;
    points: string[];
  };
  improvements?: {
    title: string;
    points: string[];
  };
  stylingAdvice?: string;
  stylingTags: string[];
  paletteSummary?: string;
}

export interface CostumeSuggestion {
  costume: TraditionalCostume;
  reason: string;
  score?: number;
}

const OCCASION_CHIPS = [
  '🎓 Lễ tốt nghiệp cử nhân đại học',
  '🧧 Du xuân & chúc Tết gia đình',
  '🥂 Dự tiệc cưới phong cách cổ phong',
  '☕ Dạo phố cổ & chụp ảnh thu Hà Nội',
  '🏛️ Triển lãm mỹ thuật di sản',
  '📸 Bộ ảnh kỷ yếu cặp đôi non nước',
  '💼 Đi làm công sở & gặp đối tác',
  '🏮 Lễ hội Trung Thu & Đêm rằm'
];

const PROMPT_SUGGESTIONS = [
  'Đội nón ba tầm quai thao buông rủ, phối chân váy xòe thanh lịch',
  'Đội nón lá bài thơ, đeo kiềng bạc hoa mai, đi guốc mộc truyền thống',
  'Đội khăn đóng chữ nhân, khoác blazer xám phom rộng đương đại',
  'Đội khăn vành dây hoàng tộc, đeo chuỗi ngọc trai quý phái',
  'Quàng khăn rằn Nam Bộ, phối quần jean suông và giày sneaker trắng',
  'Cầm quạt xếp trầm hương, túi gấm thêu hoa sen chỉ vàng'
];

const SAMPLE_STUDIO_MODELS = [
  {
    name: 'Mẫu Nữ Studio',
    url: '/images/models/female-model.jpg'
  },
  {
    name: 'Mẫu Nam Studio',
    url: '/images/models/male-model.jpg'
  }
];

const CATEGORY_NAMES: Record<string, string> = {
  jacket: 'Áo khoác / Blazer',
  shirt: 'Áo sơ mi / Croptop / Thun',
  pants: 'Quần / Chân váy',
  jewelry: 'Trang sức (Kiềng, ngọc, hoa tai)',
  accessory: 'Phụ kiện (Nón, khăn, quạt, kính)',
  bag: 'Túi xách / Ví',
  shoes: 'Giày / Guốc / Boots',
  other: 'Khác'
};

export interface HeritageColorOption {
  id: string;
  name: string;
  hex: string;
  borderHex?: string;
  textColor?: string;
  desc: string;
  meaning: string;
}

export const HERITAGE_COLORS: HeritageColorOption[] = [
  { id: 'do-dieu', name: 'Đỏ Điều', hex: '#9B2226', desc: 'Đỏ son truyền thống', meaning: 'Hỷ sự, cưới hỏi, lễ hội triều Nguyễn' },
  { id: 'vang-hoang-yen', name: 'Vàng Hoàng Yến', hex: '#E0A96D', desc: 'Vàng kim quý phái', meaning: 'Cung đình, vương giả, uy nghiêm' },
  { id: 'xanh-thien-thanh', name: 'Xanh Thiên Thanh', hex: '#457B9D', desc: 'Lam mây thanh tao', meaning: 'Nhã nhặn, dạo phố, thanh lịch' },
  { id: 'tim-hoa-ca', name: 'Tím Hoa Cà', hex: '#7209B7', desc: 'Tím cố đô thơ mộng', meaning: 'Xứ Huế, đằm thắm, cung đình' },
  { id: 'trang-nga', name: 'Trắng Ngà Tơ Tằm', hex: '#FDFBF7', borderHex: '#D5C2AF', textColor: '#2C241D', desc: 'Bạch tơ thuần khiết', meaning: 'Thanh tao, trong trẻo, tự nhiên' },
  { id: 'den-huyen', name: 'Đen Huyền', hex: '#1D1E2C', desc: 'Mun tuyền sang trọng', meaning: 'Quyền quý, lịch thiệp, cổ điển' },
  { id: 'xanh-ngoc-bich', name: 'Xanh Ngọc Bích', hex: '#2A9D8F', desc: 'Lục bảo ngọc ngà', meaning: 'Trang trọng, quý phái, thanh khiết' },
  { id: 'hong-canh-sen', name: 'Hồng Cánh Sen', hex: '#E07A5F', desc: 'Hồng sen đằm thắm', meaning: 'Duyên dáng, tươi trẻ, du xuân' },
  { id: 'nau-tram', name: 'Nâu Trầm Hương', hex: '#7F4F24', desc: 'Nâu mộc mạc', meaning: 'Dân gian, hoài niệm, bình dị' },
  { id: 'xanh-reu', name: 'Xanh Rêu Cổ Mộc', hex: '#4A6B53', desc: 'Rêu phong cổ kính', meaning: 'Thanh bình, trang nhã, thi vị' },
  { id: 'xanh-co-vit', name: 'Xanh Cổ Vịt', hex: '#1A535C', desc: 'Lam bảo quý tộc', meaning: 'Sang trọng, quý phái, chiều sâu' },
  { id: 'cam-san-ho', name: 'Cam San Hô', hex: '#E76F51', desc: 'Hỏa sắc rực rỡ', meaning: 'Tươi tắn, ấm áp, hân hoan' }
];

export interface HeritagePatternOption {
  id: string;
  name: string;
  category: 'royal' | 'nature' | 'symbol' | 'folk';
  categoryLabel: string;
  dynastyOrEra: string;
  desc: string;
  meaning: string;
  icon: string;
  placementSuggestion: string;
  promptKeyword: string;
}

export const HERITAGE_PATTERNS: HeritagePatternOption[] = [
  {
    id: 'may-song-thuy-ba',
    name: 'Mây Sóng Thủy Ba (Tam Sơn)',
    category: 'royal',
    categoryLabel: 'Hoa văn cung đình',
    dynastyOrEra: 'Triều Nguyễn & Triều Lê',
    desc: 'Sóng nước cuộn trào kết hợp mây ngũ sắc và tam sơn uy nghiêm',
    meaning: 'Tượng trưng cho giang sơn gấm vóc vững bền, thiên hạ thái bình, hưng thịnh',
    icon: '🌊',
    placementSuggestion: 'Gấu áo, vạt dưới và cổ tay áo',
    promptKeyword: 'họa tiết mây sóng thủy ba tam sơn triều Nguyễn thêu chỉ vàng'
  },
  {
    id: 'long-phung-trinh-tuong',
    name: 'Long Phụng Trình Tường',
    category: 'royal',
    categoryLabel: 'Hoa văn cung đình',
    dynastyOrEra: 'Thời Lý, Trần, Lê, Nguyễn',
    desc: 'Hình tượng chim phượng vũ ngậm hoa hoặc rồng mây uy nghiêm',
    meaning: 'Biểu trưng cho bậc vương giả, đoan trang, hỷ sự viên mãn và quý phái',
    icon: '🐉',
    placementSuggestion: 'Trước ngực, lưng áo hoặc bản nẹp cổ Nhật Bình',
    promptKeyword: 'họa tiết rồng mây phụng vũ thêu kim tuyến hoàng gia'
  },
  {
    id: 'lien-hoa-dai-viet',
    name: 'Hoa Sen Cổ Điển (Liên Hoa)',
    category: 'nature',
    categoryLabel: 'Hoa văn thanh cao',
    dynastyOrEra: 'Thời Lý - Trần - Hậu Lê',
    desc: 'Cánh sen cách điệu tinh xảo, nhụy hoa thanh thoát uyển chuyển',
    meaning: 'Quốc hoa Đại Việt, tượng trưng cho sự thuần khiết, thanh cao và an lành',
    icon: '🪷',
    placementSuggestion: 'Ngực áo, trung tâm vạt trước hoặc thêu chìm thân áo',
    promptKeyword: 'hoa văn hoa sen cổ điển Đại Việt thời Lý Trần'
  },
  {
    id: 'tu-quy-tung-cuc-truc-mai',
    name: 'Tứ Quý (Tùng Cúc Trúc Mai)',
    category: 'nature',
    categoryLabel: 'Tứ thời cát tường',
    dynastyOrEra: 'Triều Hậu Lê & Triều Nguyễn',
    desc: 'Bốn loài cây tượng trưng cho bốn mùa Xuân Hạ Thu Đông luân chuyển',
    meaning: 'Khí tiết thanh tao của bậc quân tử, sự kiên cường và phúc lộc bốn mùa',
    icon: '🌿',
    placementSuggestion: 'Dọc tà áo, viền nẹp và hai bên tay áo',
    promptKeyword: 'họa tiết tứ quý tùng cúc trúc mai thanh lịch'
  },
  {
    id: 'trong-dong-chim-lac',
    name: 'Trống Đồng & Chim Lạc',
    category: 'symbol',
    categoryLabel: 'Di sản cội nguồn',
    dynastyOrEra: 'Văn hóa Đông Sơn (Văn Lang - Âu Lạc)',
    desc: 'Mặt trời đa giác tâm trống, đàn chim Lạc bay và dải hoa văn răng cưa',
    meaning: 'Cội nguồn hào khí ngàn năm, niềm tự hào nguồn cội con rồng cháu tiên',
    icon: '☀️',
    placementSuggestion: 'Mặt trước ngực áo hoặc nẹp tà chính diện',
    promptKeyword: 'hoa văn trống đồng Đông Sơn chim Lạc cội nguồn Đại Việt'
  },
  {
    id: 'chu-tho-ngu-phuc',
    name: 'Bách Phúc Bách Thọ (Ngũ Phúc)',
    category: 'symbol',
    categoryLabel: 'Cát tường & phúc thọ',
    dynastyOrEra: 'Triều Nguyễn',
    desc: 'Chữ Thọ tròn chạm lồng ngũ phúc (5 con dơi ngậm dải lụa cát tường)',
    meaning: 'Phúc - Lộc - Thọ - Khang - Ninh, mang lại điềm lành và trường thọ',
    icon: '✨',
    placementSuggestion: 'Hai bên vạt áo, vai áo hoặc nẹp ngực',
    promptKeyword: 'họa tiết triện chữ Thọ tròn lồng ngũ phúc cát tường'
  },
  {
    id: 'gam-hoa-chim-van-phuc',
    name: 'Gấm Hoa Chìm Vân Mây Nhỏ',
    category: 'nature',
    categoryLabel: 'Lụa tơ tằm truyền thống',
    dynastyOrEra: 'Làng lụa Vạn Phúc & Nha Xá',
    desc: 'Hoa văn mây hoa dệt chìm tinh tế ẩn hiện trên nền lụa tơ tằm tự nhiên',
    meaning: 'Nét sang trọng kín đáo, quý phái tao nhã của phục trang truyền thống Việt',
    icon: '🏵️',
    placementSuggestion: 'Toàn bộ thân áo dệt chìm óng ánh',
    promptKeyword: 'hoa văn dệt chìm gấm lụa tơ tằm Vạn Phúc óng ả'
  },
  {
    id: 'hoa-cuc-van-tho',
    name: 'Hoa Cúc Vạn Thọ Thời Lê',
    category: 'nature',
    categoryLabel: 'Mỹ thuật cung đình',
    dynastyOrEra: 'Thời Lê Sơ & Lê Trung Hưng',
    desc: 'Bông cúc tỏa tròn mềm mại, dải dây leo uyển chuyển thanh nhã',
    meaning: 'Trường thọ, niềm hân hoan và vẻ đẹp quý phái bình dị',
    icon: '🌼',
    placementSuggestion: 'Viền cổ áo, nẹp vạt và gấu áo',
    promptKeyword: 'họa tiết hoa cúc dây thời Lê cung đình thanh nhã'
  }
];

interface UnifiedFittingFlowProps {
  initialWardrobeItems?: UserWardrobeItem[];
  preselectedCostume?: TraditionalCostume | null;
  onClearPreselectedCostume?: () => void;
  onClose?: () => void;
}

export const UnifiedFittingFlow: React.FC<UnifiedFittingFlowProps> = ({
  initialWardrobeItems = [],
  preselectedCostume,
  onClearPreselectedCostume,
  onClose
}) => {
  const { 
    userProfile, 
    effectiveStylingProfile, 
    wardrobeItems, 
    addWardrobeItem, 
    removeWardrobeItem 
  } = useApp();

  // Mode: 'occasion' (AI gợi ý theo dịp) hoặc 'free' (Phối đồ tự do)
  const [fittingMode, setFittingMode] = useState<'occasion' | 'free'>(
    preselectedCostume ? 'free' : 'occasion'
  );

  // Filter cho phần chọn cổ phục tự do
  const [freeEraFilter, setFreeEraFilter] = useState<string>('all');

  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(
    preselectedCostume ? 3 : 1
  );

  // Step 1 State: Occasion
  const [occasionInput, setOccasionInput] = useState<string>('🧧 Du xuân & chúc Tết gia đình');
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Step 2 State: Suggestions
  const [suggestions, setSuggestions] = useState<CostumeSuggestion[]>([]);

  // Selected Costume
  const [selectedCostume, setSelectedCostume] = useState<TraditionalCostume | null>(
    preselectedCostume || OFFICIAL_13_COSTUMES[0]
  );

  // Styling Prompt
  const [stylingPrompt, setStylingPrompt] = useState<string>(
    'Đội nón lá bài thơ, đeo kiềng bạc chạm hoa mai, phối quần suông thanh lịch'
  );

  // Color customization states (Yêu cầu mô tả màu sắc & bộ lọc màu di sản)
  const [colorDescription, setColorDescription] = useState<string>('');
  const [selectedHeritageColorIds, setSelectedHeritageColorIds] = useState<string[]>(['do-dieu']);

  const toggleHeritageColor = (colorId: string) => {
    setSelectedHeritageColorIds(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  // Pattern customization states (Lựa chọn họa tiết áo & mô tả văn bản + giọng nói)
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(['may-song-thuy-ba']);
  const [patternDescription, setPatternDescription] = useState<string>('');
  const [patternCategoryFilter, setPatternCategoryFilter] = useState<string>('all');

  const toggleHeritagePattern = (patternId: string) => {
    setSelectedPatternIds(prev =>
      prev.includes(patternId)
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };

  // Active category tab for Right Configuration Column in 2-column layout
  const [rightColTab, setRightColTab] = useState<'costume' | 'color' | 'pattern' | 'accessory' | 'wardrobe' | 'prompt'>('costume');

  // Traditional Accessories Selected (Tùy chọn - người dùng tự chọn, không chọn thì thôi)
  const [selectedTradAccessoryIds, setSelectedTradAccessoryIds] = useState<string[]>([]);
  const [showAllTradAccessories, setShowAllTradAccessories] = useState<boolean>(false);
  const [tradAccCategoryFilter, setTradAccCategoryFilter] = useState<string>('all');

  // Shelf switcher in Section 3: 'traditional' vs 'wardrobe'
  const [accessorySourceTab, setAccessorySourceTab] = useState<'traditional' | 'wardrobe'>('traditional');

  // Active Wardrobe Items selected from personal wardrobe
  const [activeWardrobeItems, setActiveWardrobeItems] = useState<UserWardrobeItem[]>(
    initialWardrobeItems
  );

  // User Photo State
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const userPhotoFileInputRef = useRef<HTMLInputElement>(null);

  // Quick Add Wardrobe Modal State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickItemName, setQuickItemName] = useState<string>('');
  const [quickItemCategory, setQuickItemCategory] = useState<string>('jewelry');
  const [quickItemImage, setQuickItemImage] = useState<string | null>(null);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const quickImageInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state for personal wardrobe items
  const [confirmDeleteWardrobeId, setConfirmDeleteWardrobeId] = useState<string | null>(null);

  // Generation & Multi-turn History State
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatingMessage, setGeneratingMessage] = useState<string>('');
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [fittingError, setFittingError] = useState<string | null>(null);
  const [geminiFittingOutput, setGeminiFittingOutput] = useState<GeminiFittingOutput | null>(null);
  const [resultViewMode, setResultViewMode] = useState<'editorial' | 'costume' | 'model'>('editorial');

  // Lookbook Modal State
  const [showLookbookModal, setShowLookbookModal] = useState<boolean>(false);

  // Quota Exceeded & Engine Mode States
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);
  const [quotaRemainingHours, setQuotaRemainingHours] = useState<number>(14);
  const [engineMode, setEngineMode] = useState<'studio-free' | 'nano-banana-pro'>('studio-free');
  const [userApiKeyInput, setUserApiKeyInput] = useState<string>(() => getSavedGeminiApiKey());

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => (14 * 3600));

  useEffect(() => {
    setSecondsRemaining(Math.max(3600, (quotaRemainingHours || 14) * 3600));
  }, [quotaRemainingHours]);

  useEffect(() => {
    if (!isQuotaExceeded && !isQuotaModalOpen) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuotaExceeded, isQuotaModalOpen]);

  const countdownHours = Math.floor(secondsRemaining / 3600);
  const countdownMinutes = Math.floor((secondsRemaining % 3600) / 60);
  const countdownSeconds = secondsRemaining % 60;

  // Restore preselected accessory from Explore section (e.g. user clicked "Thử phối món này")
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('nep_preselected_accessory');
      if (saved) {
        sessionStorage.removeItem('nep_preselected_accessory');
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setSelectedTradAccessoryIds(prev => Array.from(new Set([...prev, parsed.id])));
          setAccessorySourceTab('traditional');
          setFittingMode('free');
          setCurrentStep(3);
        }
      }
    } catch (e) {
      console.warn('Error reading preselected accessory:', e);
    }
  }, []);

  // Sync costume if preselected
  useEffect(() => {
    if (preselectedCostume) {
      setSelectedCostume(preselectedCostume);
      setFittingMode('free');
      setCurrentStep(3);
    }
  }, [preselectedCostume]);

  // Sync initial wardrobe items if passed via props
  useEffect(() => {
    if (initialWardrobeItems && initialWardrobeItems.length > 0) {
      setActiveWardrobeItems(initialWardrobeItems);
    }
  }, [initialWardrobeItems]);

  // Handle Step 1: Call API to suggest costumes
  const handleFetchSuggestions = async (targetOccasion = occasionInput) => {
    if (!targetOccasion.trim()) return;
    setIsSuggesting(true);
    setSuggestError(null);

    try {
      const res = await fetch('/api/gemini/suggest-costumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: targetOccasion.trim(),
          gender: effectiveStylingProfile.gender || 'all'
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setCurrentStep(2);
      } else {
        const fallbacks: CostumeSuggestion[] = OFFICIAL_13_COSTUMES.slice(0, 4).map(costume => ({
          costume,
          reason: `Phom dáng trang nhã của ${costume.name} (${costume.dynasty}) chuẩn mực với bối cảnh ${targetOccasion}.`
        }));
        setSuggestions(fallbacks);
        setCurrentStep(2);
      }
    } catch (err: any) {
      console.warn('API suggest error, using fallback:', err);
      const fallbacks: CostumeSuggestion[] = OFFICIAL_13_COSTUMES.slice(0, 4).map(costume => ({
        costume,
        reason: `Phom dáng trang nhã của ${costume.name} (${costume.dynasty}) phù hợp với dịp bạn đã chọn.`
      }));
      setSuggestions(fallbacks);
      setCurrentStep(2);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestedCostume = (costume: TraditionalCostume) => {
    setSelectedCostume(costume);
    setCurrentStep(3);
  };

  // Toggle Traditional Accessory selection
  const toggleTradAccessory = (accId: string) => {
    setSelectedTradAccessoryIds(prev => 
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  // Photo upload handlers
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFittingError('Vui lòng tải lên tệp định dạng hình ảnh (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserPhoto(ev.target?.result as string);
      setFittingError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraComplete = (photoUrl: string) => {
    setUserPhoto(photoUrl);
    setIsCameraOpen(false);
  };

  // Quick Add Wardrobe Item
  const handleSaveQuickWardrobeItem = () => {
    if (!quickItemName.trim()) {
      setQuickAddError('Vui lòng nhập tên món đồ, trang sức hoặc phụ kiện.');
      return;
    }
    if (!quickItemImage) {
      setQuickAddError('Vui lòng tải lên ảnh chụp món đồ của bạn.');
      return;
    }

    const res = addWardrobeItem({
      name: quickItemName.trim(),
      category: quickItemCategory as any,
      frontImage: quickItemImage
    });

    if (res.success) {
      const newItem: UserWardrobeItem = {
        id: `wardrobe-quick-${Date.now()}`,
        name: quickItemName.trim(),
        category: quickItemCategory as any,
        frontImage: quickItemImage,
        addedAt: Date.now()
      };
      setActiveWardrobeItems(prev => [newItem, ...prev.filter(i => i.name !== newItem.name)]);
      setQuickItemName('');
      setQuickItemCategory('jewelry');
      setQuickItemImage(null);
      setQuickAddError(null);
      setIsQuickAddOpen(false);
    } else {
      setQuickAddError(res.message || 'Không thể lưu món đồ.');
    }
  };

  const toggleWardrobeItemSelection = (item: UserWardrobeItem) => {
    setActiveWardrobeItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      return exists ? prev.filter(i => i.id !== item.id) : [...prev, item];
    });
  };

  const handleDeleteWardrobeItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    removeWardrobeItem(itemId);
    setActiveWardrobeItems(prev => prev.filter(i => i.id !== itemId));
    setConfirmDeleteWardrobeId(null);
  };

  // Switch directly to Studio Chân Dung Người Thật (100% Free, Zero Quota)
  const handleSwitchToStudioAndGenerate = async () => {
    if (!selectedCostume) return;
    setIsQuotaModalOpen(false);
    setIsQuotaExceeded(false);
    setIsGeneratingImage(true);
    setGeneratingMessage('Đang kết xuất chân dung người thật sắc nét chuẩn Studio 8K...');
    setCurrentStep(4);
    setResultViewMode('editorial');

    try {
      const chosenColors = HERITAGE_COLORS.filter(c => selectedHeritageColorIds.includes(c.id));
      const chosenPatterns = HERITAGE_PATTERNS.filter(p => selectedPatternIds.includes(p.id));
      const chosenTradAccessories = OFFICIAL_TRADITIONAL_ACCESSORIES.filter(a => selectedTradAccessoryIds.includes(a.id));
      const targetPhoto = userPhoto || SAMPLE_STUDIO_MODELS[0].url;

      const composed = await composeEditorialFittingImage({
        userPhoto: userPhoto || targetPhoto,
        costumeImage: selectedCostume.frontImage,
        costumeId: selectedCostume.id,
        costumeName: selectedCostume.name,
        dynasty: selectedCostume.dynasty,
        gender: (userProfile?.gender as any) || 'female',
        height: userProfile?.height || 165,
        weight: userProfile?.weight || 52,
        skinTone: 'natural',
        heritageColors: chosenColors,
        accessories: chosenTradAccessories,
        patterns: chosenPatterns,
        patternDescription: patternDescription.trim(),
        stylingPrompt: stylingPrompt.trim()
      });

      if (composed) {
        setImageHistory([composed]);
        setCurrentHistoryIndex(0);
      }

      if (!geminiFittingOutput) {
        setGeminiFittingOutput({
          harmonyScore: 95,
          critique: `Bản phối ${selectedCostume.name} (${selectedCostume.dynasty}) kết xuất người thật chân thực, toát lên phong thái đoan trang đài các.`,
          heritageAnalysis: `Kế thừa chuẩn mực nẹp cổ và cấu trúc vạt áo đặc trưng thời ${selectedCostume.dynasty}, phục sức tôn vinh trọn vẹn nét thanh tao Á Đông.`,
          accessoryVerdict: chosenTradAccessories.length > 0
            ? `Bộ phụ kiện (${chosenTradAccessories.map(a => a.name).join(', ')}) tạo điểm nhấn văn hóa sâu sắc, bổ trợ hoàn mỹ cho tổng thể.`
            : 'Lối phối tối giản tôn vinh chất liệu gấm lụa dệt tự nhiên.',
          pros: {
            title: 'Điểm sáng & Ưu điểm nổi bật của bản phối',
            points: [
              `Phom dáng ${selectedCostume.name} ôm vừa vặn vai và buông rủ tự nhiên, chuẩn mực tỷ lệ người mặc.`,
              'Hòa sắc di sản tươi sáng, nổi bật chất liệu lụa tơ tằm mềm mại.',
              'Gương mặt và thần thái người mặc hòa quyện hài hòa cùng phục sức cổ phong.'
            ]
          },
          cons: {
            title: 'Điểm chưa tốt & Những lưu ý cần cân nhắc',
            points: [
              'Cần lưu ý kiểm soát nếp gấp tà áo khi di chuyển để tránh làm mất phom đứng của cổ áo.',
              'Tránh đeo phụ kiện hiện đại có ánh kim quá chói làm lấn át vẻ trang nhã của cổ phục.'
            ]
          },
          improvements: {
            title: 'Gợi ý cải thiện để bản phối hoàn hảo hơn',
            points: [
              'Nên kết hợp cùng kiểu tóc búi thấp đoan trang hoặc cài trâm bạc thanh nhã để khoe trọn phần cổ áo.',
              'Đi kèm hài thêu mũi cong hoặc guốc mộc truyền thống để giữ chuẩn nhịp bước khoan thai.',
              'Khi chụp ảnh, hai tay khép nhẹ trước bụng hoặc cầm quạt trầm ở góc 45 độ để tôn dáng tà áo.'
            ]
          },
          stylingAdvice: 'Giữ tư thế khoan thai, hai tay khép hờ hoặc cầm nhẹ quạt/nón để tôn trọn nét đẹp của tà áo.',
          stylingTags: ['Studio Người Thật 8K', 'Chuẩn Vóc Dáng', 'Tôn Vinh Di Sản']
        });
      }
    } catch (err) {
      console.warn('Studio generation error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Trigger Gemini AI Image Generation
  const handleStartFitting = async () => {
    if (!selectedCostume) {
      setFittingError('Vui lòng chọn một trang phục cổ phục trước khi thử đồ.');
      return;
    }

    // Nếu người dùng chọn Động cơ Studio Người Thật miễn phí, chạy trực tiếp không qua API quota
    if (engineMode === 'studio-free') {
      await handleSwitchToStudioAndGenerate();
      return;
    }

    const targetPhoto = userPhoto || SAMPLE_STUDIO_MODELS[0].url;
    const chosenTradAccessories = OFFICIAL_TRADITIONAL_ACCESSORIES.filter(a => 
      selectedTradAccessoryIds.includes(a.id)
    );

    const tradNames = chosenTradAccessories.map(a => a.name).join(', ');
    const desc = tradNames ? ` cùng phụ kiện: ${tradNames}` : '';

    const chosenColors = HERITAGE_COLORS.filter(c => selectedHeritageColorIds.includes(c.id));
    const chosenPatterns = HERITAGE_PATTERNS.filter(p => selectedPatternIds.includes(p.id));

    const patternDescText = [
      chosenPatterns.length > 0 ? `Họa tiết hoa văn: ${chosenPatterns.map(p => `${p.name} (${p.desc})`).join(', ')}` : '',
      patternDescription.trim() ? `Mô tả hoa văn mong muốn: "${patternDescription.trim()}"` : ''
    ].filter(Boolean).join('. ');

    const colorDescText = [
      chosenColors.length > 0 ? `Gam màu chủ đạo mong muốn: ${chosenColors.map(c => `${c.name} (${c.hex}) - ${c.desc}`).join(', ')}` : '',
      colorDescription.trim() ? `Mô tả màu sắc chi tiết: ${colorDescription.trim()}` : ''
    ].filter(Boolean).join('. ');

    const fullStylingPrompt = [
      colorDescText,
      patternDescText,
      stylingPrompt.trim()
    ].filter(Boolean).join('. ') || 'phối đồ đương đại trang nhã tôn vinh di sản';

    setIsGeneratingImage(true);
    setFittingError(null);
    setGeneratingMessage(`AI Gemini đang dệt may ${selectedCostume.name}${desc} lên vóc dáng của bạn...`);
    setCurrentStep(4);
    setResultViewMode('editorial');

    const savedApiKey = getSavedGeminiApiKey();

    try {
      const res = await fetch('/api/gemini/generate-fitting', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(savedApiKey ? { 'x-gemini-api-key': savedApiKey } : {})
        },
        body: JSON.stringify({
          userPhoto: targetPhoto,
          costumeId: selectedCostume.id,
          costumeName: selectedCostume.name,
          stylingPrompt: fullStylingPrompt,
          apiKey: savedApiKey,
          wardrobeItems: activeWardrobeItems.map(w => ({ 
            name: w.name, 
            category: w.category,
            image: w.frontImage 
          })),
          tradAccessories: chosenTradAccessories.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category
          })),
          patterns: chosenPatterns.map(p => ({
            id: p.id,
            name: p.name,
            desc: p.desc,
            meaning: p.meaning
          })),
          patternDescription: patternDescription.trim(),
          isRefinement: false
        })
      });

      const data = await res.json();

      // Xử lý thông báo khi hết lượt tạo ảnh trực tiếp theo đúng yêu cầu
      if (data.quotaExceeded) {
        setQuotaRemainingHours(data.retryAfterHours || 14);
        setIsQuotaExceeded(true);
        setIsQuotaModalOpen(true);
        setIsGeneratingImage(false);
        if (data.geminiOutput) {
          setGeminiFittingOutput(data.geminiOutput);
        }
      }

      if (data.success) {
        if (data.geminiOutput) {
          setGeminiFittingOutput(data.geminiOutput);
        }

        let finalImageUrl = data.imageUrl;
        // Synthesize tailored editorial portrait canvas if native AI image model wasn't returned
        if (!data.isAiGeneratedImage) {
          setGeneratingMessage('Đang kết xuất bức ảnh chân dung người thật sắc nét 8K...');
          const composed = await composeEditorialFittingImage({
            userPhoto: userPhoto || targetPhoto,
            costumeImage: selectedCostume.frontImage,
            costumeId: selectedCostume.id,
            costumeName: selectedCostume.name,
            dynasty: selectedCostume.dynasty,
            gender: (userProfile?.gender as any) || 'female',
            height: userProfile?.height || 165,
            weight: userProfile?.weight || 52,
            skinTone: 'natural',
            heritageColors: chosenColors,
            accessories: chosenTradAccessories,
            patterns: chosenPatterns,
            patternDescription: patternDescription.trim(),
            stylingPrompt: fullStylingPrompt
          });
          if (composed) finalImageUrl = composed;
        }

        setImageHistory([finalImageUrl]);
        setCurrentHistoryIndex(0);
      } else {
        throw new Error(data.error || 'Không thể tạo ảnh thử đồ');
      }
    } catch (err: any) {
      console.log('[Fitting] Client synthesis fallback...');
      const composed = await composeEditorialFittingImage({
        userPhoto: userPhoto || targetPhoto,
        costumeImage: selectedCostume.frontImage,
        costumeId: selectedCostume.id,
        costumeName: selectedCostume.name,
        dynasty: selectedCostume.dynasty,
        gender: (userProfile?.gender as any) || 'female',
        height: userProfile?.height || 165,
        weight: userProfile?.weight || 52,
        skinTone: 'natural',
        heritageColors: chosenColors,
        accessories: chosenTradAccessories,
        patterns: chosenPatterns,
        patternDescription: patternDescription.trim(),
        stylingPrompt: fullStylingPrompt
      });
      setImageHistory([composed || targetPhoto]);
      setCurrentHistoryIndex(0);
      setFittingError(null);
      if (!geminiFittingOutput) {
        setGeminiFittingOutput({
          harmonyScore: 92,
          critique: `Bản phối ${selectedCostume.name} thể hiện trọn vẹn nét đoan trang và mỹ cảm cổ truyền Đại Việt kết hợp đương đại.`,
          heritageAnalysis: `Cấu trúc tà áo chuẩn mực triều ${selectedCostume.dynasty}, đường cắt may tôn dáng và trang nghiêm.`,
          accessoryVerdict: tradNames ? `Phụ kiện ${tradNames} tạo điểm nhấn văn hóa sâu sắc.` : 'Tối giản phụ kiện làm nổi bật chất gấm lụa quý giá.',
          pros: {
            title: 'Điểm sáng & Ưu điểm nổi bật của bản phối',
            points: [
              `Phom dáng ${selectedCostume.name} (${selectedCostume.dynasty}) tôn vinh dáng vẻ thanh lịch và đoan trang.`,
              `Hòa sắc di sản được lựa chọn tinh tế, toát lên chiều sâu thẩm mỹ cổ truyền.`,
              tradNames ? `Sự hiện diện của ${tradNames} làm đậm nét văn hóa bản địa.` : 'Lối phối tối giản làm nổi bật sự tinh xảo của đường may cổ phục.'
            ]
          },
          cons: {
            title: 'Điểm chưa tốt & Những lưu ý cần cân nhắc',
            points: [
              'Cần chú ý giữ nếp tà áo phẳng phiu khi di chuyển để tránh làm xô lệch dáng áo.',
              'Tránh mang cùng phụ kiện hiện đại có độ bóng quá chói làm phân tán điểm nhấn của cổ phục.'
            ]
          },
          improvements: {
            title: 'Gợi ý cải thiện để bản phối hoàn hảo hơn',
            points: [
              'Kết hợp cùng kiểu tóc vấn khăn hoặc cài trâm mộc mạc để hoàn thiện thần thái truyền thống.',
              'Nên đi hài thêu hoặc guốc mộc để bước đi thêm khoan thai và đồng điệu với tà áo.',
              'Khi tạo dáng, khép hai tay nhẹ trước vạt áo để tạo đường rủ tự nhiên cho trang phục.'
            ]
          },
          stylingAdvice: 'Giữ dáng đứng đoan trang, khoan thai để tà áo buông rủ tự nhiên.',
          stylingTags: ['Thanh Lịch Đương Đại', 'Tôn Vinh Di Sản', 'Hài Hòa Điển Chế']
        });
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Multi-turn Refinement
  const handleRefineResult = async () => {
    if (!refinementPrompt.trim() || isGeneratingImage) return;

    const currentImage = imageHistory[currentHistoryIndex];
    if (!currentImage || !selectedCostume) return;

    const chosenTradAccessories = OFFICIAL_TRADITIONAL_ACCESSORIES.filter(a => 
      selectedTradAccessoryIds.includes(a.id)
    );
    const chosenColors = HERITAGE_COLORS.filter(c => selectedHeritageColorIds.includes(c.id));
    const chosenPatterns = HERITAGE_PATTERNS.filter(p => selectedPatternIds.includes(p.id));

    setIsGeneratingImage(true);
    setFittingError(null);
    setGeneratingMessage(`Đang tinh chỉnh ảnh hiện tại theo yêu cầu: "${refinementPrompt}"...`);

    try {
      const res = await fetch('/api/gemini/generate-fitting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhoto: userPhoto || currentImage,
          currentResultImage: currentImage,
          costumeId: selectedCostume.id,
          costumeName: selectedCostume.name,
          stylingPrompt: refinementPrompt.trim(),
          wardrobeItems: activeWardrobeItems.map(w => ({ name: w.name, category: w.category })),
          tradAccessories: chosenTradAccessories.map(a => ({ id: a.id, name: a.name })),
          patterns: chosenPatterns.map(p => ({ id: p.id, name: p.name })),
          patternDescription: patternDescription.trim(),
          isRefinement: true
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.geminiOutput) {
          setGeminiFittingOutput(data.geminiOutput);
        }

        let refinedImageUrl = data.imageUrl;
        if (!data.isAiGeneratedImage) {
          const composed = await composeEditorialFittingImage({
            userPhoto: userPhoto,
            costumeImage: selectedCostume.frontImage,
            costumeName: selectedCostume.name,
            dynasty: selectedCostume.dynasty,
            heritageColors: chosenColors,
            accessories: chosenTradAccessories,
            patterns: chosenPatterns,
            patternDescription: patternDescription.trim(),
            stylingPrompt: `${stylingPrompt} + ${refinementPrompt.trim()}`,
            isRefinement: true
          });
          if (composed) refinedImageUrl = composed;
        }

        const newHistory = [...imageHistory.slice(0, currentHistoryIndex + 1), refinedImageUrl];
        setImageHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
        setRefinementPrompt('');
      } else {
        throw new Error(data.error || 'Không thể chỉnh sửa ảnh');
      }
    } catch (err: any) {
      console.log('[Refinement] Refinement notice:', err?.message || 'Fallback to current image');
      setFittingError('Đã ghi nhận tinh chỉnh của bạn.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadResultImage = () => {
    const imgUrl = activeResultPhoto;
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `nep-heritage-fitting-${selectedCostume?.id || 'outfit'}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUndoVersion = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1);
    }
  };

  const handleStartOver = () => {
    setImageHistory([]);
    setCurrentHistoryIndex(-1);
    setUserPhoto(null);
    setRefinementPrompt('');
    onClearPreselectedCostume?.();
    if (fittingMode === 'occasion') {
      setCurrentStep(1);
    } else {
      setCurrentStep(3);
    }
  };

  // Filter costumes for Free Styling mode
  const filteredCostumes = OFFICIAL_13_COSTUMES.filter(c => {
    if (freeEraFilter === 'all') return true;
    if (freeEraFilter === 'nguyen') return c.dynasty.includes('Nguyễn');
    if (freeEraFilter === 'le') return c.dynasty.includes('Lê');
    if (freeEraFilter === 'folk') return c.id === 'ao-ba-ba' || c.id === 'ao-tu-than' || c.id === 'ao-yem' || c.id === 'ao-dai-lemur';
    if (freeEraFilter === 'unisex') return c.genderSupport === 'both' || c.gender === 'unisex';
    if (freeEraFilter === 'female') return c.gender === 'female' || c.genderSupport === 'both';
    if (freeEraFilter === 'male') return c.gender === 'male' || c.genderSupport === 'both';
    return true;
  });

  // Accessories that typically accompany the selected costume
  const matchingCostumeAccessories = getAccessoriesForCostume(selectedCostume?.id);
  const otherCostumeAccessories = OFFICIAL_TRADITIONAL_ACCESSORIES.filter(
    a => !matchingCostumeAccessories.some(m => m.id === a.id)
  );

  // Phân chia Nam / Nữ cho phụ kiện đi cùng áo trong quá trình phối đồ
  const isCostumeUnisex = selectedCostume?.gender === 'unisex' || selectedCostume?.genderSupport === 'both';
  const hasMaleFittingAccs = matchingCostumeAccessories.some(a => a.gender === 'male');
  const hasFemaleFittingAccs = matchingCostumeAccessories.some(a => a.gender === 'female');
  const shouldShowFittingGenderTabs = isCostumeUnisex || (hasMaleFittingAccs && hasFemaleFittingAccs);

  const [fittingAccGenderTab, setFittingAccGenderTab] = useState<'female' | 'male' | 'all'>('all');

  const displayedFittingAccessories = useMemo(() => {
    if (!shouldShowFittingGenderTabs) return matchingCostumeAccessories;
    if (fittingAccGenderTab === 'female') {
      return matchingCostumeAccessories.filter(a => a.gender === 'female' || a.gender === 'both');
    }
    if (fittingAccGenderTab === 'male') {
      return matchingCostumeAccessories.filter(a => a.gender === 'male' || a.gender === 'both');
    }
    return matchingCostumeAccessories;
  }, [shouldShowFittingGenderTabs, fittingAccGenderTab, matchingCostumeAccessories]);

  const activeResultPhoto = useMemo(() => {
    if (resultViewMode === 'costume') {
      return selectedCostume?.frontImage || '/images/costumes/ao-nhat-binh.jpg';
    }
    if (resultViewMode === 'model') {
      return userPhoto || SAMPLE_STUDIO_MODELS[0].url;
    }
    return imageHistory[currentHistoryIndex] || selectedCostume?.frontImage || '/images/costumes/ao-nhat-binh.jpg';
  }, [resultViewMode, imageHistory, currentHistoryIndex, userPhoto, selectedCostume]);
  const chosenTradAccessoriesList = OFFICIAL_TRADITIONAL_ACCESSORIES.filter(a => selectedTradAccessoryIds.includes(a.id));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-14 animate-in fade-in duration-300">
      {/* =====================================================================
          MODE SWITCHER BAR: PHỐI THEO DỊP vs PHỐI ĐỒ TỰ DO
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E9DFD1] shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F5EDE1] rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setFittingMode('occasion');
              if (currentStep > 3) setCurrentStep(1);
            }}
            className={`flex-1 sm:flex-initial py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              fittingMode === 'occasion'
                ? 'bg-[#800E13] text-white shadow-xs'
                : 'text-[#6C584C] hover:text-[#800E13]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phối Theo Dịp (AI Đề Xuất)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFittingMode('free');
              setCurrentStep(3);
              if (!selectedCostume) setSelectedCostume(OFFICIAL_13_COSTUMES[0]);
            }}
            className={`flex-1 sm:flex-initial py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              fittingMode === 'free'
                ? 'bg-[#800E13] text-white shadow-xs'
                : 'text-[#6C584C] hover:text-[#800E13]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Phối Đồ Tự Do</span>
          </button>
        </div>

        {/* Quick status counters and Close button */}
        <div className="flex items-center gap-2 text-xs text-[#6C584C] shrink-0">
          <span className="hidden sm:inline">Phụ kiện:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 font-bold text-xs font-mono">
            {selectedTradAccessoryIds.length} món
          </span>
          <span className="hidden sm:inline">• Tủ đồ:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#800E13]/10 text-[#800E13] font-bold text-xs font-mono">
            {wardrobeItems.length} món
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-1 sm:ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-semibold text-xs transition-colors border border-stone-200 cursor-pointer shadow-2xs"
              title="Đóng xưởng phối đồ và quay lại trang Khám phá"
            >
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>Đóng xưởng</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumbs for Occasion mode */}
      {fittingMode === 'occasion' && currentStep < 4 && (
        <div className="bg-white/90 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-[#E9DFD1] shadow-xs flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 1 
                ? 'bg-[#800E13] text-white font-bold shadow-xs' 
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
            }`}
          >
            <span>1. Chọn Dịp</span>
            {currentStep > 1 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-[#B0A294]" />

          <button
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            disabled={currentStep < 2}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 2 
                ? 'bg-[#800E13] text-white font-bold shadow-xs' 
                : currentStep > 2 
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold cursor-pointer' 
                  : 'text-[#8C7A6B] opacity-50 cursor-not-allowed'
            }`}
          >
            <span>2. Đề Xuất Cổ Phục ({suggestions.length > 0 ? suggestions.length : 'Đa dạng'})</span>
            {currentStep > 2 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-[#B0A294]" />

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
              currentStep === 3 
                ? 'bg-[#800E13] text-white font-bold shadow-xs' 
                : 'text-[#8C7A6B] opacity-50'
            }`}
          >
            <span>3. Phối Phụ Kiện, Tủ Đồ & Thử Ảnh</span>
          </div>
        </div>
      )}

      {/* =====================================================================
          OCCASION BƯỚC 1: CHỌN DỊP SỬ DỤNG
          ===================================================================== */}
      {fittingMode === 'occasion' && currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DFD1] shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
              Bước 1: Ngữ Cảnh & Không Gian Điển Chế
            </span>
            <h2 className="font-heritage text-2xl font-bold text-[#2C241D]">
              Bạn dự định diện Cổ phục vào dịp gì?
            </h2>
            <p className="text-xs sm:text-sm text-[#6C584C]">
              AI Gemini sẽ tra cứu hệ thống điển chế trang phục cung đình và dân gian, sau đó đề xuất tất cả các mẫu cổ phục phù hợp nhất từ phần Khám phá.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={occasionInput}
                onChange={(e) => setOccasionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchSuggestions()}
                placeholder="VD: Du xuân chúc Tết, Lễ tốt nghiệp cử nhân, Dạ tiệc cưới..."
                className="w-full py-3.5 pl-4 pr-32 bg-[#FAF6F0] border border-[#DFD4C4] rounded-2xl text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13]"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <VoiceInputButton
                  onTranscript={(val: string) => setOccasionInput(val)}
                  buttonClassName="p-2"
                />
                <button
                  type="button"
                  onClick={() => handleFetchSuggestions()}
                  disabled={isSuggesting || !occasionInput.trim()}
                  className="px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  {isSuggesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Đề Xuất</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {suggestError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{suggestError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                  Hoặc chọn nhanh các dịp phổ biến (nhấp chọn rồi bấm "Đề Xuất"):
                </span>
                {occasionInput && (
                  <span className="text-[10px] text-[#800E13] font-semibold">
                    Đã chọn: {occasionInput}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {OCCASION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setOccasionInput(chip);
                      // User must click button "Đề Xuất" to trigger AI
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      occasionInput === chip
                        ? 'bg-[#800E13] text-white border-[#800E13] font-bold shadow-xs'
                        : 'bg-[#FAF6F0] text-[#5C4D3C] border-[#E5DACB] hover:border-[#800E13] hover:text-[#800E13]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          OCCASION BƯỚC 2: KẾT QUẢ ĐỀ XUẤT TỪ KHÁM PHÁ (NHIỀU HƠN 3 TRANG PHỤC)
          ===================================================================== */}
      {fittingMode === 'occasion' && currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E9DFD1] shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13]">
                Kết Quả Phân Tích Điển Chế Cho
              </span>
              <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#2C241D]">
                "{occasionInput}"
              </h3>
              <p className="text-xs text-[#6C584C] mt-0.5">
                Tìm thấy <strong>{suggestions.length} mẫu cổ phục</strong> phù hợp từ kho Khám phá để bạn lựa chọn:
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-[#6C584C] hover:text-[#800E13] border border-[#D5C2AF] rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Đổi dịp khác</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map((item, idx) => {
              const costume = item.costume;
              return (
                <div
                  key={costume.id || idx}
                  className="bg-white rounded-3xl overflow-hidden border border-[#E9DFD1] shadow-sm hover:shadow-lg hover:border-[#800E13] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-3/4 bg-[#EFE7DC] overflow-hidden">
                      <CostumeImage
                        src={costume.frontImage}
                        alt={costume.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-[#E9C46A] text-[10px] font-bold font-mono">
                        {costume.dynasty}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                          {costume.name}
                        </h4>
                        <p className="text-xs text-[#6C584C] line-clamp-2 mt-1">
                          {costume.shortDesc}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF5EE] rounded-xl border border-[#EADFCF] text-xs text-[#800E13] space-y-1">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-[#A33]">
                          Lý Do Đề Xuất:
                        </span>
                        <p className="leading-relaxed text-[11px] text-[#5C4D3C]">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleSelectSuggestedCostume(costume)}
                      className="w-full py-3 px-4 bg-[#800E13] hover:bg-[#9B2226] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#800E13]/20 cursor-pointer"
                    >
                      <span>Chọn Trang Phục Này & Phối Đồ</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          BƯỚC 3: PHÒNG THỬ ĐỒ TỰ DO THEO TỪNG THẺ TAB
          ===================================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Bar */}
          <div className="bg-[#FAF6F0] p-3.5 sm:p-4 rounded-2xl border border-[#E8DAC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#800E13]/10 text-[#800E13]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-heritage text-base sm:text-lg font-bold text-[#2C241D]">
                  Phòng Phối Đồ Tự Do Theo Từng Thẻ Tab
                </h3>
                <p className="text-xs text-[#7B6858]">
                  Chọn trang phục, màu sắc, phụ kiện & tủ đồ theo từng thẻ tab • Xem tóm tắt và thử đồ bên dưới
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7B6858] font-medium">
              <span className="px-3 py-1 rounded-full bg-white border border-[#DFD1BD] font-semibold text-[#800E13] shadow-2xs">
                Chế độ từng thẻ tab
              </span>
            </div>
          </div>

          {/* 1. HÌNH ẢNH CỦA BẠN (NHỎ BỚT, COMPACT HORIZONTAL CARD) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E9DFD1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#800E13]" />
                <h4 className="font-heritage text-sm font-bold text-[#2C241D]">
                  Hình ảnh của bạn
                </h4>
              </div>
              {userPhoto && (
                <button
                  type="button"
                  onClick={() => setUserPhoto(null)}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Xóa ảnh
                </button>
              )}
            </div>

            <input
              type="file"
              ref={userPhotoFileInputRef}
              onChange={handlePhotoFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Hàng ngang nhỏ gọn */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 p-3 bg-[#FAF6F0] rounded-2xl border border-[#E9DFD1]">
              {/* Thumbnail xem trước nhỏ gọn */}
              <div className="relative w-24 sm:w-28 h-32 sm:h-36 rounded-xl overflow-hidden border border-[#D5C2AF] bg-white shrink-0 shadow-2xs group flex items-center justify-center">
                {userPhoto ? (
                  <>
                    <img
                      src={userPhoto}
                      alt="Hình ảnh của bạn"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-800/90 text-white text-[9px] font-bold shadow-xs">
                      ✓ Đã có ảnh
                    </div>
                    <button
                      onClick={() => setUserPhoto(null)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-700 text-white rounded-full transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => userPhotoFileInputRef.current?.click()}
                      className="absolute bottom-1.5 left-1.5 right-1.5 py-1 px-1.5 bg-black/65 hover:bg-black/85 text-white text-[10px] font-semibold rounded-lg backdrop-blur-xs transition-colors text-center cursor-pointer"
                    >
                      Đổi ảnh
                    </button>
                  </>
                ) : (
                  <div className="p-2 text-center text-[#8C7A6B] space-y-1">
                    <Camera className="w-6 h-6 mx-auto opacity-60 text-[#800E13]" />
                    <span className="text-[10px] font-medium block leading-tight">Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Các thao tác tải/chụp và mẫu studio nhỏ gọn bên cạnh */}
              <div className="flex-1 flex flex-col justify-between space-y-2.5 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => userPhotoFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{userPhoto ? 'Đổi ảnh khác' : 'Tải ảnh từ máy / điện thoại'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-[#D5C2AF] text-[#4A3E35] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#800E13]" />
                    <span>Chụp ảnh Camera</span>
                  </button>
                </div>

                {/* Chọn nhanh ảnh mẫu studio */}
                <div className="pt-1.5 border-t border-stone-200/80 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                    Hoặc chọn mẫu studio:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {SAMPLE_STUDIO_MODELS.map(m => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setUserPhoto(m.url)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] transition-all cursor-pointer ${
                          userPhoto === m.url
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                            : 'bg-white text-[#5C4D3C] border-[#E9DFD1] hover:border-[#800E13]'
                        }`}
                      >
                        <img src={m.url} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vóc dáng tóm tắt */}
                <div className="text-[11px] text-[#7B6858]">
                  Vóc dáng: <strong>{effectiveStylingProfile.name}</strong> ({effectiveStylingProfile.height}cm • {effectiveStylingProfile.weight}kg)
                </div>
              </div>
            </div>
          </div>

          {/* 2. TAB CHỌN ĐỒ PHỐI (CHO LÊN TRƯỚC) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E9DFD1] shadow-xs space-y-5">
            {/* Tab Navigation Header */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
                  Tab Chọn Đồ Phối
                </span>
                <span className="text-xs text-[#7B6858]">
                  Bấm từng thẻ tab để chọn trang phục, màu sắc & phụ kiện
                </span>
              </div>

              <div className="flex p-1.5 bg-[#FAF3EA] rounded-2xl border border-[#DFD4C4] overflow-x-auto gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRightColTab('costume')}
                  className={`flex-1 min-w-[95px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'costume'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>👘 Cổ Phục</span>
                  {selectedCostume && <span className="w-1.5 h-1.5 rounded-full bg-[#E9C46A]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRightColTab('color')}
                  className={`flex-1 min-w-[95px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'color'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>🎨 Màu Sắc</span>
                  {(selectedHeritageColorIds.length > 0 || colorDescription.trim()) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRightColTab('pattern')}
                  className={`flex-1 min-w-[105px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'pattern'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>🧵 Họa Tiết</span>
                  {(selectedPatternIds.length > 0 || patternDescription.trim()) && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      rightColTab === 'pattern' ? 'bg-white/20 text-white' : 'bg-[#E9DFD1] text-[#6C584C]'
                    }`}>
                      {selectedPatternIds.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRightColTab('accessory')}
                  className={`flex-1 min-w-[110px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'accessory'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>🪭 Phụ Kiện</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    rightColTab === 'accessory' ? 'bg-white/20 text-white' : 'bg-[#E9DFD1] text-[#6C584C]'
                  }`}>
                    {selectedTradAccessoryIds.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightColTab('wardrobe')}
                  className={`flex-1 min-w-[95px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'wardrobe'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>👜 Tủ Đồ</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    rightColTab === 'wardrobe' ? 'bg-white/20 text-white' : 'bg-[#E9DFD1] text-[#6C584C]'
                  }`}>
                    {activeWardrobeItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightColTab('prompt')}
                  className={`flex-1 min-w-[100px] py-2.5 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rightColTab === 'prompt'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                  }`}
                >
                  <span>✨ Ý Tưởng & Gợi Ý</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CHỌN ÁO CỔ PHỤC */}
            {rightColTab === 'costume' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
                      Thẻ 1: Chọn Áo Cổ Phục
                    </span>
                    <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                      Kho 13 Cổ Phục Chuẩn Di Sản
                    </h4>
                  </div>

                  {/* Filter chips triều đại */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'nguyen', label: 'Triều Nguyễn' },
                      { id: 'le', label: 'Lê Sơ / Hậu Lê' },
                      { id: 'folk', label: 'Dân gian & Nam Bộ' },
                      { id: 'unisex', label: 'Unisex' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFreeEraFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          freeEraFilter === f.id
                            ? 'bg-[#800E13] text-white shadow-2xs'
                            : 'bg-[#FAF6F0] text-[#6C584C] hover:text-[#800E13] border border-[#E9DFD1]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid cổ phục */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[440px] overflow-y-auto p-1">
                  {filteredCostumes.map((c) => {
                    const isSelected = selectedCostume?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCostume(c)}
                        className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col group ${
                          isSelected
                            ? 'border-[#800E13] ring-2 ring-[#800E13]/25 bg-amber-50/40 shadow-xs'
                            : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#D4A373]'
                        }`}
                      >
                        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-stone-100 mb-2">
                          <CostumeImage
                            src={c.frontImage}
                            alt={c.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/65 text-[#E9C46A] text-[9px] font-bold">
                            {c.dynasty}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 p-1 bg-[#800E13] text-white rounded-full shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h5 className="font-heritage text-xs font-bold text-[#2C241D] truncate">
                          {c.name}
                        </h5>
                        <p className="text-[10px] text-[#6C584C] line-clamp-1 mt-0.5">
                          {c.shortDesc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setRightColTab('color')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tiếp tục: Chọn Màu Sắc</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MÔ TẢ & BỘ LỌC MÀU SẮC */}
            {rightColTab === 'color' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#800E13] text-[11px] font-bold uppercase tracking-wider mb-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Thẻ 2: Mô Tả & Bộ Lọc Màu Sắc Mong Muốn</span>
                    </div>
                    <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                      Tông Màu Cổ Phục & Phối Đồ
                    </h4>
                    <p className="text-xs text-[#6C584C] mt-0.5">
                      Chọn màu từ bảng lọc màu di sản hoặc gõ mô tả màu mong muốn để Gemini phối chuẩn sắc độ
                    </p>
                  </div>

                  {selectedHeritageColorIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedHeritageColorIds([])}
                      className="self-start sm:self-auto text-xs text-[#800E13] hover:underline font-semibold cursor-pointer"
                    >
                      Bỏ chọn màu
                    </button>
                  )}
                </div>

                {/* BẢNG LỌC MÀU DI SẢN (SWATCHES) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#4A3E35] uppercase tracking-wider">
                      Bảng lọc màu di sản (Nhấp chọn 1 hoặc nhiều màu):
                    </span>
                    <span className="text-[11px] text-[#800E13] font-semibold">
                      Đã chọn: {selectedHeritageColorIds.length} màu
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {HERITAGE_COLORS.map((col) => {
                      const isSelected = selectedHeritageColorIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleHeritageColor(col.id)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 group ${
                            isSelected
                              ? 'bg-amber-50/80 border-[#800E13] ring-2 ring-[#800E13]/25 shadow-xs'
                              : 'bg-[#FAF8F5] border-[#E9DFD1] hover:border-[#D4A373]'
                          }`}
                        >
                          <div 
                            className="w-7 h-7 rounded-full shrink-0 border shadow-2xs flex items-center justify-center relative transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: col.hex, 
                              borderColor: col.borderHex || '#D5C2AF' 
                            }}
                          >
                            {isSelected && (
                              <Check 
                                className="w-4 h-4 stroke-[3]" 
                                style={{ color: col.textColor || '#FFFFFF' }} 
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-[#2C241D] truncate">
                              {col.name}
                            </span>
                            <span className="block text-[10px] text-[#7B6858] truncate">
                              {col.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ô MÔ TẢ MÀU SẮC TÙY CHỈNH */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#4A3E35] uppercase tracking-wider block">
                      Hoặc mô tả màu sắc mong muốn theo ý bạn:
                    </label>
                    <span className="text-[10px] text-[#7B6858]">
                      Hỗ trợ gõ chữ hoặc nói qua micro
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={colorDescription}
                      onChange={(e) => setColorDescription(e.target.value)}
                      placeholder="VD: Áo ngoài đỏ son tơ tằm, vạt trong màu trắng ngà, quần phi bóng đen tuyền..."
                      className="w-full pl-4 pr-12 py-3 bg-[#FAF6F0] border border-[#DFD4C4] rounded-2xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                      <VoiceInputButton
                        onTranscript={(text) => setColorDescription(text)}
                        placeholderPrompt="Nói màu sắc: Áo đỏ son, quần trắng ngà..."
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Gợi ý phối màu di sản kinh điển */}
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-[#8C7A6B] block mb-1.5">
                      Gợi ý cặp màu kinh điển (bấm để điền nhanh):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Đỏ điều & Vàng hoàng yến',
                        'Trắng ngà tơ tằm & Lam mây',
                        'Tím cố đô & Xanh ngọc bích',
                        'Đen tuyền mun & Trắng ngà',
                        'Hồng cánh sen & Xanh thiên thanh',
                        'Xanh rêu cổ mộc & Nâu trầm hương'
                      ].map((combo) => (
                        <button
                          key={combo}
                          type="button"
                          onClick={() => setColorDescription(combo)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#F3EBE0] text-[#5C4D3C] text-[11px] border border-[#E9DFD1] transition-colors cursor-pointer"
                        >
                          + {combo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setRightColTab('costume')}
                    className="text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold cursor-pointer"
                  >
                    ← Quay lại chọn Cổ phục
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightColTab('pattern')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tiếp tục: Chọn Họa Tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: LỰA CHỌN HỌA TIẾT ÁO & MÔ TẢ VĂN BẢN + VOICE */}
            {rightColTab === 'pattern' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#800E13] text-[11px] font-bold uppercase tracking-wider mb-1">
                      <span>🧵 Thẻ: Họa Tiết Hoa Văn Cổ Phục</span>
                    </div>
                    <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                      Lựa Chọn Hoa Văn Áo & Ý Tưởng Họa Tiết
                    </h4>
                    <p className="text-xs text-[#6C584C]">
                      Chọn hoa văn điển chế truyền thống hoặc dùng chữ & giọng nói để yêu cầu thêu dệt theo ý bạn
                    </p>
                  </div>

                  {selectedPatternIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPatternIds([])}
                      className="self-start sm:self-center text-xs text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                    >
                      Bỏ chọn tất cả ({selectedPatternIds.length})
                    </button>
                  )}
                </div>

                {/* Bộ lọc phân loại hoa văn */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF4EB] rounded-xl border border-[#DFD4C4]">
                  {[
                    { id: 'all', label: 'Tất Cả', icon: '✨' },
                    { id: 'royal', label: 'Cung Đình Hoàng Gia', icon: '👑' },
                    { id: 'nature', label: 'Thiên Nhiên & Tứ Thời', icon: '🪷' },
                    { id: 'symbol', label: 'Biểu Tượng Cội Nguồn', icon: '☀️' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPatternCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        patternCategoryFilter === tab.id
                          ? 'bg-[#800E13] text-white shadow-2xs font-bold'
                          : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-white/60'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Danh sách thẻ hoa văn điển chế */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {HERITAGE_PATTERNS.filter(p => patternCategoryFilter === 'all' || p.category === patternCategoryFilter).map(pat => {
                    const isSelected = selectedPatternIds.includes(pat.id);
                    return (
                      <div
                        key={pat.id}
                        onClick={() => toggleHeritagePattern(pat.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                          isSelected
                            ? 'bg-[#FDF7F0] border-[#800E13] ring-2 ring-[#800E13]/25 shadow-xs'
                            : 'bg-white border-[#E9DFD1] hover:border-[#800E13]/50 hover:bg-[#FDFBF7]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                            isSelected ? 'bg-[#800E13] text-white' : 'bg-[#FAF3EA] border border-[#E0D3C1]'
                          }`}>
                            <span>{pat.icon}</span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-heritage text-sm font-bold text-[#2C241D] leading-snug">
                                {pat.name}
                              </h5>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                                isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                              }`}>
                                {isSelected ? '✓ Đã chọn' : pat.dynastyOrEra}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#786454] leading-relaxed line-clamp-2">
                              {pat.desc}
                            </p>

                            <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/60 font-medium">
                                📍 {pat.placementSuggestion}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                                📜 {pat.categoryLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ý nghĩa văn hóa */}
                        <div className="pt-1.5 border-t border-[#EFE7DC] text-[10px] text-[#8C7A6B] flex items-center gap-1">
                          <span className="font-semibold text-[#800E13]">Ý nghĩa:</span>
                          <span className="truncate">{pat.meaning}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* KHU VỰC: MÔ TẢ HOA VĂN MONG MUỐN (TEXT + VOICE INPUT) */}
                <div className="p-4 bg-[#FAF4EB] rounded-2xl border border-[#DFD4C4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2C241D] block">
                        Mô Tả Hoa Văn Mong Muốn (Văn Bản + Giọng Nói Voice):
                      </span>
                      <span className="text-[11px] text-[#7B6858]">
                        Gõ chữ hoặc bấm nút micro nói để AI đưa chính xác hoa văn vào bản phối
                      </span>
                    </div>
                    {patternDescription.trim() && (
                      <button
                        type="button"
                        onClick={() => setPatternDescription('')}
                        className="text-[11px] text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                      >
                        Xóa mô tả
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={patternDescription}
                      onChange={(e) => setPatternDescription(e.target.value)}
                      placeholder="VD: Thêu hoa văn rồng bay trước ngực chỉ vàng, sóng nước chân vạt áo, hoa sen nhỏ viền cổ..."
                      className="w-full pl-4 pr-12 py-3 bg-white border border-[#DFD4C4] rounded-2xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                      <VoiceInputButton
                        onTranscript={(text) => setPatternDescription(prev => prev ? `${prev} ${text}` : text)}
                        placeholderPrompt="Nói hoa văn: Thêu rồng mây trước ngực, sóng nước chân vạt..."
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Gợi ý hoa văn kinh điển để nhấp điền nhanh */}
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-[#8C7A6B] block mb-1.5">
                      Gợi ý mô tả hoa văn kinh điển (bấm để thêm nhanh):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Rồng mây thêu chỉ kim tuyến trước ngực',
                        'Mây sóng thủy ba tam sơn dệt gấu áo',
                        'Hoa sen Đại Việt dệt chìm vạt trước',
                        'Tứ quý tùng cúc trúc mai dọc nẹp tà',
                        'Mặt trời trống đồng Đông Sơn và chim Lạc',
                        'Gấm hoa chìm dệt tơ tằm Vạn Phúc óng ả',
                        'Cúc vạn thọ thời Lê thanh nhã viền cổ áo'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPatternDescription(item)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F3EBE0] text-[#5C4D3C] text-[11px] border border-[#E2D5C3] transition-colors cursor-pointer"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nút điều hướng chân tab */}
                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setRightColTab('color')}
                    className="text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold cursor-pointer"
                  >
                    ← Quay lại chọn Màu sắc
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightColTab('accessory')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tiếp tục: Chọn Phụ Kiện</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PHỤ KIỆN THƯỜNG ĐI CÙNG ÁO */}
            {rightColTab === 'accessory' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
                      Thẻ 3: Phụ Kiện Đặc Trưng Đi Cùng Áo
                    </span>
                    <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                      Phụ Kiện Cổ Truyền Điển Chế ({matchingCostumeAccessories.length} món)
                    </h4>
                    <p className="text-xs text-[#6C584C]">
                      Tùy chọn • Bạn có thể tick chọn món muốn diện cùng hoặc để trống nếu muốn diện áo thuần túy
                    </p>
                  </div>

                  {selectedTradAccessoryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTradAccessoryIds([])}
                      className="self-start sm:self-auto text-xs text-[#800E13] hover:underline font-semibold cursor-pointer"
                    >
                      Bỏ chọn tất cả ({selectedTradAccessoryIds.length})
                    </button>
                  )}
                </div>

                {/* Phân chia Nam / Nữ */}
                {shouldShowFittingGenderTabs && (
                  <div className="flex items-center gap-1 p-1 bg-[#FAF6F0] rounded-xl text-xs font-bold border border-[#E8DAC8]">
                    <button
                      type="button"
                      onClick={() => setFittingAccGenderTab('female')}
                      className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                        fittingAccGenderTab === 'female' ? 'bg-[#800E13] text-white shadow-2xs' : 'text-[#6C584C]'
                      }`}
                    >
                      Nữ giới
                    </button>
                    <button
                      type="button"
                      onClick={() => setFittingAccGenderTab('male')}
                      className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                        fittingAccGenderTab === 'male' ? 'bg-[#800E13] text-white shadow-2xs' : 'text-[#6C584C]'
                      }`}
                    >
                      Nam giới
                    </button>
                    <button
                      type="button"
                      onClick={() => setFittingAccGenderTab('all')}
                      className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                        fittingAccGenderTab === 'all' ? 'bg-[#800E13] text-white shadow-2xs' : 'text-[#6C584C]'
                      }`}
                    >
                      Tất cả
                    </button>
                  </div>
                )}

                {/* Grid phụ kiện */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1 max-h-[400px] overflow-y-auto">
                  {displayedFittingAccessories.map((acc) => {
                    const isSelected = selectedTradAccessoryIds.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleTradAccessory(acc.id)}
                        className={`relative p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'border-[#800E13] bg-amber-50/60 ring-2 ring-[#800E13]/20 shadow-xs'
                            : 'border-[#E9DFD1] bg-white hover:border-[#D4A373]'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF6F0] mb-2 p-2 flex items-center justify-center border border-[#EFE7DC]">
                            <AccessoryImage
                              src={acc.image}
                              fallbackSrc={acc.image}
                              alt={acc.name}
                              className="w-full h-full object-contain drop-shadow-xs transition-transform group-hover:scale-105"
                            />
                            <div className="absolute top-1.5 left-1.5 text-[#800E13]">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#800E13] bg-white rounded-xs" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-400 bg-white/70 rounded-xs" />
                              )}
                            </div>
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[#E9C46A] text-[8px] font-bold">
                              {acc.region}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#800E13] block truncate">
                              {acc.badge}
                            </span>
                            <h5 className="font-semibold text-xs text-[#2C241D] line-clamp-1 group-hover:text-[#800E13]">
                              {acc.name}
                            </h5>
                            <p className="text-[10px] text-[#6C584C] line-clamp-2 mt-0.5">
                              {acc.wearingGuide || acc.culturalMeaning}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-stone-100">
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-[#800E13]' : 'text-stone-400'}`}>
                            {isSelected ? '✓ Đang chọn' : 'Nhấp để chọn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Xem thêm phụ kiện khác */}
                {otherCostumeAccessories.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAllTradAccessories(!showAllTradAccessories)}
                      className="text-xs text-[#800E13] hover:text-[#9B2226] font-bold flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span>
                        {showAllTradAccessories 
                          ? '− Thu gọn các phụ kiện khác' 
                          : `+ Xem thêm ${otherCostumeAccessories.length} phụ kiện cổ phong khác (nếu muốn phối thêm)`}
                      </span>
                    </button>

                    {showAllTradAccessories && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto p-1">
                        {otherCostumeAccessories.map((acc) => {
                          const isSelected = selectedTradAccessoryIds.includes(acc.id);
                          return (
                            <div
                              key={acc.id}
                              onClick={() => toggleTradAccessory(acc.id)}
                              className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#800E13] bg-amber-50/60 ring-2 ring-[#800E13]/20 shadow-xs'
                                  : 'border-[#E9DFD1] bg-white hover:border-[#D4A373]'
                              }`}
                            >
                              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF6F0] mb-1 p-1 flex items-center justify-center">
                                <AccessoryImage
                                  src={acc.image}
                                  fallbackSrc={acc.image}
                                  alt={acc.name}
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute top-1 left-1">
                                  {isSelected ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-[#800E13] bg-white rounded-xs" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-stone-400 bg-white/70 rounded-xs" />
                                  )}
                                </div>
                              </div>
                              <h6 className="font-semibold text-[11px] text-[#2C241D] line-clamp-1">
                                {acc.name}
                              </h6>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setRightColTab('pattern')}
                    className="text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold cursor-pointer"
                  >
                    ← Quay lại chọn Họa Tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightColTab('wardrobe')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tiếp tục: Tủ Đồ Của Tôi</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: TỦ ĐỒ CỦA TÔI (CHỈ CẦN 1 ẢNH MẶT TRƯỚC) */}
            {rightColTab === 'wardrobe' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
                      Thẻ 4: Tủ Đồ Riêng Của Bạn
                    </span>
                    <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                      Phối Cùng Đồ Cá Nhân (Chỉ Cần Ảnh Mặt Trước)
                    </h4>
                    <p className="text-xs text-[#6C584C]">
                      Không cần mô hình 3D phức tạp, chỉ cần chụp hoặc tải 1 ảnh mặt trước rõ nét của món đồ
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm món mới</span>
                  </button>
                </div>

                {wardrobeItems.length === 0 ? (
                  <div className="p-6 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#DFD1BD] text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#A6907D] mx-auto opacity-70" />
                    <p className="text-xs font-semibold text-[#5C4D3C]">
                      Tủ đồ riêng của bạn chưa có món đồ nào
                    </p>
                    <p className="text-[11px] text-[#8C7A6B] max-w-md mx-auto">
                      Chỉ cần chụp 1 ảnh mặt trước của túi xách, giày, blazer hay trang sức của bạn để đưa vào tủ đồ.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#800E13] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#9B2226] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Chụp / Tải ảnh mặt trước món đồ lên</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[360px] overflow-y-auto p-1">
                    {wardrobeItems.map((item) => {
                      const isSelected = activeWardrobeItems.some(i => i.id === item.id);
                      const isConfirming = confirmDeleteWardrobeId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleWardrobeItemSelection(item)}
                          className={`relative p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#800E13] bg-amber-50/40 ring-2 ring-[#800E13]/15 shadow-xs'
                              : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#D4A373]'
                          }`}
                        >
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                            {item.frontImage ? (
                              <img src={item.frontImage} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute top-1.5 left-1.5 text-[#800E13]">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#800E13] bg-white rounded-xs" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-400 bg-white/70 rounded-xs" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B] block truncate">
                              {CATEGORY_NAMES[item.category] || 'Món đồ'}
                            </span>
                            <h5 className="font-semibold text-xs text-[#2C241D] truncate">
                              {item.name}
                            </h5>
                          </div>

                          <div 
                            className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-[#800E13] font-bold' : 'text-stone-400'}`}>
                              {isSelected ? '✓ Đang phối' : 'Chưa chọn'}
                            </span>
                            {isConfirming ? (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteWardrobeItem(e, item.id)}
                                className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors cursor-pointer"
                              >
                                Xóa?
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteWardrobeId(item.id);
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Xóa món này khỏi tủ đồ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setRightColTab('accessory')}
                    className="text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold cursor-pointer"
                  >
                    ← Quay lại chọn Phụ Kiện
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightColTab('prompt')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tiếp tục: Ý Tưởng Phối</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: Ý TƯỞNG & GỢI Ý PHỐI ĐỒ */}
            {rightColTab === 'prompt' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13]">
                    Thẻ 5: Ý Tưởng Phối & Biến Tấu Đương Đại
                  </span>
                  <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                    Mô Tả Chi Tiết Phong Cách Mong Muốn
                  </h4>
                  <p className="text-xs text-[#6C584C]">
                    Bạn có thể yêu cầu chi tiết về bối cảnh chụp ảnh, kiểu tóc, dáng đứng hoặc phong cách đương đại phối cùng
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={stylingPrompt}
                    onChange={(e) => setStylingPrompt(e.target.value)}
                    placeholder="VD: Đội nón lá bài thơ, đeo kiềng bạc hoa mai, đi guốc mộc, phối với quần jean ống suông..."
                    className="w-full p-4 pr-12 bg-[#FAF6F0] border border-[#DFD4C4] rounded-2xl text-xs sm:text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13] resize-none"
                  />
                  <div className="absolute right-3 top-3">
                    <VoiceInputButton
                      onTranscript={(val: string) => setStylingPrompt(val)}
                      buttonClassName="p-2"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-2">
                    Gợi ý phong cách phối cùng phụ kiện (nhấp để điền nhanh):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PROMPT_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setStylingPrompt(sug)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          stylingPrompt === sug
                            ? 'bg-amber-50/80 border-[#800E13] text-[#800E13] font-semibold shadow-2xs'
                            : 'bg-[#FAF6F0] text-[#5C4D3C] border-[#E9DFD1] hover:border-[#800E13]'
                        }`}
                      >
                        • {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setRightColTab('costume')}
                    className="text-xs text-[#7B6858] hover:text-[#2C241D] font-semibold cursor-pointer"
                  >
                    ← Quay lại chọn Cổ phục
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. CỔ PHỤC & LỚP PHỐI ĐANG CHỌN (ĐẨY XUỐNG DƯỚI) */}
          {selectedCostume && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E9DFD1] shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#800E13]" />
                  <h4 className="font-heritage text-base font-bold text-[#2C241D]">
                    2. Cổ Phục & Lớp Phối Đang Chọn
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setRightColTab('costume')}
                  className="text-xs text-[#800E13] hover:underline font-bold cursor-pointer"
                >
                  Đổi áo khác
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E9DFD1]">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-2xs">
                  <CostumeImage
                    src={selectedCostume.frontImage}
                    alt={selectedCostume.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13] bg-[#800E13]/10 px-2 py-0.5 rounded-md">
                      {selectedCostume.dynasty}
                    </span>
                    <span className="text-xs text-[#7B6858]">
                      {selectedCostume.gender === 'female' ? 'Dáng Nữ ♀' : selectedCostume.gender === 'male' ? 'Dáng Nam ♂' : 'Nam & Nữ ⚥'}
                    </span>
                  </div>
                  <h5 className="font-heritage text-base font-bold text-[#2C241D]">
                    {selectedCostume.name}
                  </h5>
                  <p className="text-xs text-[#6C584C] line-clamp-2">
                    {selectedCostume.shortDesc}
                  </p>
                </div>
              </div>

              {/* Chi tiết các lớp phối */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100 text-xs">
                {/* Màu sắc */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9DFD1] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#4A3E35] block">🎨 Tông màu mong muốn:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedHeritageColorIds.length > 0 ? (
                      HERITAGE_COLORS.filter(c => selectedHeritageColorIds.includes(c.id)).map(c => (
                        <span 
                          key={c.id} 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold"
                          style={{ borderColor: c.hex, backgroundColor: `${c.hex}15` }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8C7A6B] text-[11px]">Tự nhiên theo ảnh gốc</span>
                    )}
                    {colorDescription.trim() && (
                      <span className="text-[10px] text-[#6C584C] italic block w-full truncate mt-0.5">
                        "{colorDescription}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Họa tiết hoa văn */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9DFD1] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#4A3E35] block">
                    🧵 Họa tiết áo ({selectedPatternIds.length} kiểu):
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedPatternIds.length > 0 ? (
                      HERITAGE_PATTERNS.filter(p => selectedPatternIds.includes(p.id)).map(p => (
                        <span 
                          key={p.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50/80 border border-amber-300 text-[10px] font-semibold text-amber-900"
                        >
                          <span>{p.icon}</span>
                          <span className="truncate max-w-[90px]">{p.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8C7A6B] text-[11px]">Gấm hoa chìm tự nhiên</span>
                    )}
                    {patternDescription.trim() && (
                      <span className="text-[10px] text-[#6C584C] italic block w-full truncate mt-0.5">
                        "{patternDescription}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Phụ kiện */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9DFD1] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#4A3E35] block">
                    🪭 Phụ kiện ({chosenTradAccessoriesList.length} món):
                  </span>
                  <span className="text-[11px] text-[#6C584C] block line-clamp-2">
                    {chosenTradAccessoriesList.length > 0 
                      ? chosenTradAccessoriesList.map(a => a.name).join(', ')
                      : 'Chưa chọn món nào (áo thuần túy)'}
                  </span>
                </div>

                {/* Tủ đồ riêng */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9DFD1] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#4A3E35] block">
                    👜 Tủ đồ riêng ({activeWardrobeItems.length} món):
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium block line-clamp-2">
                    {activeWardrobeItems.length > 0 
                      ? activeWardrobeItems.map(w => w.name).join(', ')
                      : 'Chưa kết hợp món cá nhân'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. CHỌN ĐỘNG CƠ TẠO ẢNH & NÚT THỬ ĐỒ */}
          <div className="space-y-4 pt-2">
            {fittingError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fittingError}</span>
              </div>
            )}

            {/* Bộ chọn động cơ tạo ảnh */}
            <div className="p-4 rounded-2xl bg-white border border-[#E9DFD1] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#800E13]" />
                  <span className="text-xs font-bold text-[#2C241D]">Chọn Động Cơ Tạo Ảnh Lookbook:</span>
                </div>
                {engineMode === 'studio-free' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Khuyên dùng • 100% Miễn phí
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Google Gemini Image
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEngineMode('studio-free')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    engineMode === 'studio-free'
                      ? 'border-[#800E13] bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EA] ring-2 ring-[#800E13]/20 shadow-xs'
                      : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#800E13]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2C241D] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#800E13]" />
                      <span>Studio Chân Dung Người Thật</span>
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Miễn phí 100%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6C584C] leading-relaxed">
                    Ghép người thật sắc nét, chuẩn vóc dáng & diện mạo Á Đông. <strong>Không lo hết quota.</strong>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngineMode('nano-banana-pro')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    engineMode === 'nano-banana-pro'
                      ? 'border-[#800E13] bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EA] ring-2 ring-[#800E13]/20 shadow-xs'
                      : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#800E13]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2C241D] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                      <span>Nano Banana Pro</span>
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      AI Direct
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6C584C] leading-relaxed">
                    Mô hình Google Gemini Cloud • Hạn mức dùng chung theo ngày hoặc API Key cá nhân.
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartFitting}
              disabled={isGeneratingImage || !selectedCostume}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 bg-gradient-to-r from-[#800E13] via-[#9B2226] to-[#800E13] hover:from-[#9B2226] hover:to-[#B22222] text-white font-bold text-base sm:text-lg rounded-2xl transition-all shadow-xl shadow-[#800E13]/30 cursor-pointer disabled:opacity-50 hover:scale-[1.005] active:scale-[0.995]"
            >
              <Sparkles className="w-5 h-5 text-[#E9C46A] animate-pulse" />
              <span>
                {engineMode === 'studio-free'
                  ? '✨ Bắt Đầu Thử Đồ Bằng Studio Người Thật (Miễn Phí)'
                  : '✨ Bắt Đầu Thử Đồ Bằng Nano Banana Pro (Gemini AI)'}
              </span>
            </button>
            <p className="text-xs text-center text-[#7B6858]">
              {engineMode === 'studio-free'
                ? 'Studio sẽ hòa trộn chân dung người thật, tà áo cổ phục, vóc dáng và phụ kiện sắc nét 8K'
                : 'Gemini sẽ hòa trộn hình ảnh của bạn, tà áo cổ phục, gam màu và các phụ kiện đã chọn lên người'}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          BƯỚC 4: KẾT QUẢ THỬ ĐỒ & CHỈNH SỬA NHIỀU LƯỢT (MULTI-TURN)
          ===================================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {fittingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fittingError}</span>
            </div>
          )}

          {/* MÀN HÌNH THÔNG BÁO HẾT LƯỢT TẠO ẢNH THEO YÊU CẦU */}
          {isQuotaExceeded && imageHistory.length === 0 ? (
            <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#E9DFD1] p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in">
              {/* Headline Ribbon */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#800E13] via-[#9B2226] to-[#6A040F] text-white text-center space-y-3 relative overflow-hidden shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto shadow-inner">
                  <Clock className="w-8 h-8 text-[#E9C46A] animate-pulse" />
                </div>
                <h3 className="font-heritage text-xl sm:text-2xl font-bold leading-snug text-[#FFF8EB] max-w-xl mx-auto">
                  Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau {countdownHours > 0 ? countdownHours : 1} giờ
                </h3>
                <p className="text-xs sm:text-sm text-[#F5EDE1]/90 max-w-lg mx-auto">
                  Hạn mức dùng chung miễn phí mỗi ngày của mô hình Nano Banana Pro đã tạm thời hết. Vui lòng quay lại sau thời gian trên hoặc chọn 1 trong 2 giải pháp bên dưới:
                </p>

                {/* Live Countdown Clock */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/20 text-xs sm:text-sm font-mono text-amber-200 shadow-inner">
                  <span>⏳ Thời gian mở lại:</span>
                  <span className="font-bold text-white tracking-widest text-sm sm:text-base">
                    {String(countdownHours).padStart(2, '0')}:{String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* 2 Lựa chọn hành động giải pháp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Lựa chọn 1: Chuyển sang Studio Chân Dung Người Thật (100% Free) */}
                <div className="p-6 rounded-2xl border-2 border-[#800E13] bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF3E6] space-y-4 relative flex flex-col justify-between shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#800E13] text-[#E9C46A] text-[10px] font-bold uppercase tracking-wider">
                        Khuyên Dùng • 100% Miễn Phí
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Không Giới Hạn Lượt
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#800E13] text-[#E9C46A] flex items-center justify-center shrink-0 shadow-sm">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-heritage text-base sm:text-lg font-bold text-[#2C241D]">
                          Chuyển Sang Studio Chân Dung Người Thật
                        </h4>
                        <p className="text-xs text-[#6C584C] mt-1 leading-relaxed">
                          Tự động kết xuất chân dung người thật sắc nét 8K mặc bộ {selectedCostume?.name}, chuẩn vóc dáng, khuôn mặt, phụ kiện và hoa văn. <strong>Tạo ngay tức thì.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwitchToStudioAndGenerate}
                    className="w-full py-3.5 px-5 bg-[#800E13] hover:bg-[#9B2226] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#800E13]/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                    <span>Tạo Bằng Studio Người Thật Ngay (Miễn Phí)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Lựa chọn 2: Dùng Google Gemini API Key cá nhân */}
                <div className="p-6 rounded-2xl border border-[#DFD4C4] bg-white space-y-4 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#800E13]" />
                        <span className="text-xs font-bold text-[#2C241D]">Mở Khóa Bằng API Key Riêng</span>
                      </div>
                      <span className="text-[10px] text-[#8C7A6B] bg-stone-100 px-2 py-0.5 rounded-md font-mono">
                        Google AI Studio
                      </span>
                    </div>

                    <p className="text-xs text-[#6C584C] leading-relaxed">
                      Nhập Google Gemini API Key riêng của bạn để tiếp tục tạo ảnh với Nano Banana Pro mà không bị hạn chế bởi hạn mức dùng chung.
                    </p>

                    <div className="space-y-2 pt-1">
                      <input
                        type="password"
                        value={userApiKeyInput}
                        onChange={(e) => setUserApiKeyInput(e.target.value)}
                        placeholder="Dán API Key (bắt đầu bằng AIzaSy...)"
                        className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30 font-mono"
                      />
                      <div className="flex items-center justify-between text-[11px]">
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#800E13] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Lấy key miễn phí</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const clean = userApiKeyInput.trim();
                            if (clean) {
                              saveGeminiApiKey(clean);
                              setIsQuotaExceeded(false);
                              setIsQuotaModalOpen(false);
                              handleStartFitting();
                            }
                          }}
                          disabled={!userApiKeyInput.trim()}
                          className="px-3.5 py-1.5 bg-[#800E13] text-white rounded-lg font-bold text-xs hover:bg-[#9B2226] disabled:opacity-40 cursor-pointer"
                        >
                          Lưu & Thử Lại
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-[#5C4D3C] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <span>← Quay lại chỉnh sửa trang phục & phụ kiện</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Banner thông báo nếu hết quota khi đang xem kết quả cũ */}
              {isQuotaExceeded && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 text-[#2C241D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#800E13] shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold text-sm text-[#800E13] block">
                        Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau {countdownHours > 0 ? countdownHours : 1} giờ
                      </span>
                      <span className="text-xs text-[#5C4D3C]">
                        Thời gian mở lại: {String(countdownHours).padStart(2, '0')}:{String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}. Bạn có thể chuyển sang Studio Người Thật để tiếp tục.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchToStudioAndGenerate}
                    className="px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span>Dùng Studio Người Thật (Miễn phí)</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 sm:p-8 rounded-3xl border border-[#E9DFD1] shadow-xs">
            {/* Left: Result Image & History Controls */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* View mode switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F5EDE1] rounded-xl mb-3 self-center sm:self-start">
                <button
                  type="button"
                  onClick={() => setResultViewMode('editorial')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    resultViewMode === 'editorial'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:bg-[#EBDDCB]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>Bản Phối Đồ AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultViewMode('costume')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    resultViewMode === 'costume'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:bg-[#EBDDCB]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Cổ Phục Gốc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultViewMode('model')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    resultViewMode === 'model'
                      ? 'bg-[#800E13] text-white shadow-xs'
                      : 'text-[#6C584C] hover:bg-[#EBDDCB]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Người Mẫu / Bạn</span>
                </button>
              </div>

              {/* Main Image Frame - warm luxury styling, never pitch black */}
              <div className="relative w-full aspect-3/4 max-w-[440px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#2B231D] via-[#1F1914] to-[#14100D] shadow-2xl border-4 border-[#C5A880]/30 flex items-center justify-center">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                      <div className="w-10 h-10 rounded-full bg-[#800E13]/80 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#E9C46A] animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-base sm:text-lg text-[#F5EDE1] block">
                        Đang kết xuất với Gemini AI...
                      </span>
                      <p className="text-xs text-[#C5A880] mt-1 max-w-[280px]">
                        {generatingMessage || 'Dệt may tà áo và phối hòa sắc di sản lên vóc dáng...'}
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#800E13] via-[#D4AF37] to-[#800E13] rounded-full w-full animate-shimmer" />
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={activeResultPhoto}
                      alt="Ảnh kết quả phối đồ Gemini"
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        console.warn('[Fitting] Image onError triggered, falling back to canonical costume.');
                        e.currentTarget.src = selectedCostume?.frontImage || '/images/costumes/ao-nhat-binh.jpg';
                      }}
                    />

                    {/* Corner badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 border border-[#C5A880]/30">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                      <span>
                        {resultViewMode === 'costume'
                          ? 'Cổ Phục Nguyên Bản'
                          : resultViewMode === 'model'
                          ? 'Chân Dung Gốc'
                          : `Phiên bản #${currentHistoryIndex + 1}`}
                      </span>
                      {currentHistoryIndex > 0 && resultViewMode === 'editorial' && (
                        <span className="text-amber-300 text-[9px] uppercase font-mono">(Đã tinh chỉnh)</span>
                      )}
                    </div>

                    {/* Undo button */}
                    {currentHistoryIndex > 0 && resultViewMode === 'editorial' && (
                      <button
                        onClick={handleUndoVersion}
                        className="absolute top-3 right-3 px-3 py-1 bg-white/95 hover:bg-white text-[#2C241D] rounded-full text-xs font-bold shadow-md flex items-center gap-1 transition-all cursor-pointer"
                        title="Quay lại phiên bản trước đó"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-[#800E13]" />
                        <span>Quay lại bản trước</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons under image: Download HD, History */}
              <div className="w-full max-w-[440px] mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDownloadResultImage}
                  disabled={isGeneratingImage || !activeResultPhoto}
                  className="flex-1 py-2.5 px-4 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#800E13]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-[#E9C46A]" />
                  <span>Tải Ảnh HD Về Máy</span>
                </button>

                {imageHistory.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-2 rounded-xl border border-[#E9DFD1]">
                    <span className="text-[11px] text-[#8C7A6B] font-medium mr-1">Các lượt:</span>
                    <div className="flex gap-1">
                      {imageHistory.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentHistoryIndex(idx);
                            setResultViewMode('editorial');
                          }}
                          className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            idx === currentHistoryIndex && resultViewMode === 'editorial'
                              ? 'bg-[#800E13] text-white shadow-xs'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Gemini AI Editorial Output & Multi-turn Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                      <span>Kết Quả Giám Tuyển AI Gemini • Nếp Editorial</span>
                    </span>
                    {selectedCostume?.dynasty && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#F5EDE1] text-[#6C584C] rounded-full border border-[#DFD4C4] font-medium">
                        {selectedCostume.dynasty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heritage text-2xl font-bold text-[#2C241D] mt-1">
                    {selectedCostume?.name}
                  </h3>
                  <p className="text-xs text-[#6C584C] mt-1 italic">
                    Phong cách yêu cầu: "{stylingPrompt}"
                  </p>

                  {/* Active badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedPatternIds.map(pid => {
                      const pat = HERITAGE_PATTERNS.find(p => p.id === pid);
                      if (!pat) return null;
                      return (
                        <span key={pat.id} className="text-[10px] px-2 py-0.5 bg-rose-50 text-[#800E13] border border-rose-200 rounded-md font-medium">
                          🧵 {pat.icon} {pat.name}
                        </span>
                      );
                    })}
                    {patternDescription.trim() && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50/80 text-amber-900 border border-amber-200 rounded-md font-medium italic">
                        🧵 "{patternDescription.slice(0, 30)}{patternDescription.length > 30 ? '...' : ''}"
                      </span>
                    )}
                    {chosenTradAccessoriesList.map(a => (
                      <span key={a.id} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-md font-medium">
                        🪭 {a.name}
                      </span>
                    ))}
                    {activeWardrobeItems.map(w => (
                      <span key={w.id} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium">
                        ✓ {w.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gemini AI Editorial Cards Output */}
                <div className="space-y-3">
                  {/* 1. Harmony Score Card */}
                  <div className="p-3.5 bg-gradient-to-r from-[#FAF6F0] to-[#FFFDF9] rounded-2xl border border-[#DFD4C4] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#800E13] text-[#E9C46A] flex items-center justify-center font-bold text-xs shadow-xs">
                        <Award className="w-5 h-5 text-[#E9C46A]" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#800E13] tracking-wide block">
                          Điểm Hòa Sắc & Chuẩn Mực Di Sản
                        </span>
                        <span className="text-xs font-semibold text-[#2C241D]">
                          {geminiFittingOutput?.harmonyScore ? `${geminiFittingOutput.harmonyScore}/100` : '94/100'} • Chuẩn Mực Điển Chế
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Rất Hài Hòa
                      </span>
                    </div>
                  </div>

                  {/* 2. AI Critique Verdict */}
                  <div className="p-4 bg-[#FFFDF9] rounded-2xl border-l-4 border-l-[#800E13] border border-[#E5DACB] shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-[#800E13] font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                      <span>Lời Bình Giám Tuyển AI Gemini</span>
                    </div>
                    <p className="text-xs text-[#2C241D] leading-relaxed">
                      {geminiFittingOutput?.critique ||
                        `Bản phối ${selectedCostume?.name} thể hiện trọn vẹn nét đoan trang đài các, kết nối hài hòa giữa mỹ cảm cổ truyền Đại Việt và nhịp sống đương đại.`}
                    </p>
                  </div>

                  {/* 3-PART DETAILED EVALUATION (TỐT Ở ĐIỂM NÀO, CHƯA TỐT Ở ĐIỂM NÀO, CẦN CẢI THIỆN ĐIỀU GÌ) */}
                  <div className="space-y-3 pt-1">
                    {/* Phần 1: Tốt ở điểm nào (Ưu điểm) */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>1. Điểm Tốt & Điểm Sáng Của Bản Phối</span>
                      </div>
                      <ul className="space-y-1.5 pl-1 text-xs text-emerald-950">
                        {(geminiFittingOutput?.pros?.points && geminiFittingOutput.pros.points.length > 0
                          ? geminiFittingOutput.pros.points
                          : [
                              `Phom dáng ${selectedCostume?.name} ôm vai buông tà chuẩn mực, tôn vinh khí chất trang nhã.`,
                              `Hòa sắc di sản được định hình rõ nét, làm nổi bật chất gấm lụa truyền thống.`,
                              chosenTradAccessoriesList.length > 0
                                ? `Phụ kiện ${chosenTradAccessoriesList.map(a => a.name).join(', ')} bổ trợ tinh tế chiều sâu văn hóa.`
                                : `Lối phối tối giản tôn trọn vẹn đường cắt may cổ truyền.`
                            ]
                        ).map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold text-[11px] mt-0.5">•</span>
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Phần 2: Chưa tốt / Cần lưu ý ở điểm nào (Hạn chế) */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>2. Điểm Chưa Tốt & Những Điều Cần Lưu Ý</span>
                      </div>
                      <ul className="space-y-1.5 pl-1 text-xs text-amber-950">
                        {(geminiFittingOutput?.cons?.points && geminiFittingOutput.cons.points.length > 0
                          ? geminiFittingOutput.cons.points
                          : [
                              chosenTradAccessoriesList.length > 2
                                ? `Số lượng phụ kiện khá nhiều (${chosenTradAccessoriesList.length} món), có thể làm nặng tổng thể nếu diện trong không gian nhỏ.`
                                : `Cần lưu ý kiểm soát nếp gấp tà áo khi di chuyển để tránh làm mất phom đứng của cổ áo.`,
                              `Tông màu cần được kết hợp cùng ánh sáng tự nhiên hoặc studio ấm để tránh làm sạm da.`
                            ]
                        ).map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-700 font-bold text-[11px] mt-0.5">•</span>
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Phần 3: Cần cải thiện thêm điều gì để hoàn thiện */}
                    <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-sky-700 shrink-0" />
                        <span>3. Cần Cải Thiện Thêm Để Hoàn Thiện Bản Phối</span>
                      </div>
                      <ul className="space-y-1.5 pl-1 text-xs text-sky-950">
                        {(geminiFittingOutput?.improvements?.points && geminiFittingOutput.improvements.points.length > 0
                          ? geminiFittingOutput.improvements.points
                          : [
                              `Nên kết hợp cùng kiểu tóc búi thấp đoan trang hoặc cài trâm bạc thanh nhã để khoe trọn phần cổ áo.`,
                              `Đi kèm hài thêu mũi cong hoặc guốc mộc truyền thống để giữ chuẩn nhịp bước khoan thai.`,
                              `Khi chụp ảnh, hai tay khép nhẹ trước bụng hoặc cầm nhẹ quạt trầm ở góc 45 độ để tôn dáng tà áo.`
                            ]
                        ).map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-sky-700 font-bold text-[11px] mt-0.5">•</span>
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 4. Heritage Analysis & Accessory Verdict Accordion / List */}
                  {geminiFittingOutput?.heritageAnalysis && (
                    <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E5DACB] space-y-1.5 text-xs">
                      <span className="font-bold text-[#6C584C] text-[11px] uppercase tracking-wide block">
                        🏛️ Phân Tích Điển Chế & Quy Thức:
                      </span>
                      <p className="text-[#3E342B] leading-relaxed">
                        {geminiFittingOutput.heritageAnalysis}
                      </p>
                    </div>
                  )}

                  {geminiFittingOutput?.accessoryVerdict && (
                    <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E5DACB] space-y-1.5 text-xs">
                      <span className="font-bold text-[#6C584C] text-[11px] uppercase tracking-wide block">
                        🪭 Đánh Giá Phụ Kiện:
                      </span>
                      <p className="text-[#3E342B] leading-relaxed">
                        {geminiFittingOutput.accessoryVerdict}
                      </p>
                    </div>
                  )}

                  {/* 5. Styling Tags */}
                  {geminiFittingOutput?.stylingTags && geminiFittingOutput.stylingTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {geminiFittingOutput.stylingTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-[#FAF6F0] text-[#800E13] border border-[#DFD4C4] rounded-md font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Multi-turn Refinement input */}
                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E5DACB] space-y-3">
                  <div className="flex items-center gap-1.5 text-[#800E13] font-bold text-xs uppercase tracking-wider">
                    <Wand2 className="w-4 h-4 text-[#800E13]" />
                    <span>Chỉnh Sửa Thêm Bằng AI (Nhiều Lượt)</span>
                  </div>
                  <p className="text-[11px] text-[#6C584C]">
                    Nhập yêu cầu để Gemini tiếp tục biến tấu trực tiếp trên bức ảnh hiện tại (không tạo lại từ đầu).
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRefineResult()}
                      placeholder="VD: Đổi sang nón lá bài thơ, thêm kiềng bạc hoa mai..."
                      className="flex-1 px-3 py-2.5 bg-white border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30"
                    />
                    <button
                      onClick={handleRefineResult}
                      disabled={isGeneratingImage || !refinementPrompt.trim()}
                      className="px-4 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      Gửi
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Đổi sang nón lá bài thơ thanh nhã',
                      'Thêm kiềng bạc hoa mai sáng bóng',
                      'Ánh sáng hoàng hôn phố cổ rêu phong'
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setRefinementPrompt(sug)}
                        className="text-[10px] px-2.5 py-1 bg-white hover:bg-stone-100 text-[#5C4D3C] rounded-lg border border-[#E5DACB] transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-[#E9DFD1]">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-[#800E13] to-[#A31D1D] hover:from-[#9B2226] hover:to-[#B22222] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#800E13]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E9C46A]" />
                  <span>Xác Nhận, Hoàn Tất & Chấm Điểm (Bước 5)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-2.5 px-4 bg-white hover:bg-stone-50 border border-[#D5C2AF] text-[#6C584C] font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Quay lại chỉnh sửa phối đồ
                  </button>

                  <button
                    onClick={handleStartOver}
                    className="py-2.5 px-4 bg-white hover:bg-stone-50 border border-[#D5C2AF] text-rose-700 font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Làm lại từ đầu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* =====================================================================
          BƯỚC 5: CHẤM ĐIỂM & XUẤT LOOKBOOK
          ===================================================================== */}
      {currentStep === 5 && selectedCostume && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                  Bước Cuối Cùng
                </span>
                <h3 className="font-heritage text-lg font-bold text-[#2C241D]">
                  Bản Giám Định Di Sản & Phiếu Phối Đồ
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLookbookModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#800E13]/25 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#E9C46A]" />
                <span>Xuất Lookbook Di Sản</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9DFD1] p-4 sm:p-6 shadow-xs">
            <OutfitCritiqueSection />
          </div>
        </div>
      )}

      {/* Modal Quick Add Personal Item */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative flex flex-col w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl overflow-hidden border border-[#E9DFD1] my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DFD1] bg-[#F5EDE1]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#800E13]">
                  Tủ Đồ Của Tôi • Không Giới Hạn Số Lượng
                </span>
                <h3 className="font-heritage text-lg font-bold text-[#2C241D]">
                  Thêm Món Đồ, Trang Sức & Phụ Kiện Mới
                </h3>
              </div>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {quickAddError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{quickAddError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Tên món đồ / Trang sức / Phụ kiện <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={quickItemName}
                  onChange={(e) => setQuickItemName(e.target.value)}
                  placeholder="VD: Kiềng bạc chạm hoa mai, Blazer xám, Nón quai thao..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Nhóm phân loại
                </label>
                <select
                  value={quickItemCategory}
                  onChange={(e) => setQuickItemCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] focus:outline-none focus:ring-2 focus:ring-[#800E13]/30"
                >
                  <option value="jewelry">💍 Trang sức (Kiềng bạc, hoa tai, chuỗi ngọc, vòng)</option>
                  <option value="accessory">🪭 Phụ kiện (Nón, khăn lụa, quạt trầm, kính)</option>
                  <option value="jacket">🧥 Áo khoác / Blazer đương đại</option>
                  <option value="shirt">👕 Áo sơ mi / Áo croptop / Áo thun</option>
                  <option value="pants">👖 Quần âu / Quần jean / Chân váy</option>
                  <option value="bag">👜 Túi xách / Ví cầm tay</option>
                  <option value="shoes">👞 Giày / Guốc mộc / Boots</option>
                  <option value="other">📦 Món đồ khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Ảnh chụp món đồ <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  ref={quickImageInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setQuickItemImage(ev.target?.result as string);
                      setQuickAddError(null);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />

                <div 
                  onClick={() => quickImageInputRef.current?.click()}
                  className={`w-full aspect-16/9 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
                    quickItemImage 
                      ? 'border-emerald-500 bg-emerald-50/20' 
                      : 'border-[#CBB9A1] bg-[#FAF6F0] hover:border-[#800E13]'
                  }`}
                >
                  {quickItemImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={quickItemImage} alt="Ảnh món đồ" className="max-h-full object-contain rounded-xl" />
                      <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md">
                        Nhấp để đổi ảnh
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1 text-[#8C7A6B]">
                      <Upload className="w-8 h-8 mx-auto text-[#800E13]" />
                      <p className="text-xs font-bold text-[#4A3E35]">Tải ảnh món đồ lên</p>
                      <p className="text-[10px] text-[#A6907D]">Hỗ trợ PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#F8F3EC] border-t border-[#E9DFD1] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="px-4 py-2 bg-white text-[#6C584C] border border-[#D5C2AF] text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSaveQuickWardrobeItem}
                className="px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Lưu & Phối Cùng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <CameraFlowModal
          onComplete={handleCameraComplete}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Lookbook Export Modal */}
      {showLookbookModal && selectedCostume && (
        <LookbookExportModal
          outfit={{
            costume: selectedCostume,
            modernGarment: activeWardrobeItems[0] || null,
            accessories: chosenTradAccessoriesList as any,
            colorPalette: [],
            harmonyScore: 95
          } as any}
          userPhotoUrl={activeResultPhoto}
          userProfile={userProfile}
          onClose={() => setShowLookbookModal(false)}
        />
      )}

      {/* Quota Exceeded Modal */}
      <QuotaExceededNoticeModal
        isOpen={isQuotaModalOpen}
        retryAfterHours={quotaRemainingHours}
        onClose={() => setIsQuotaModalOpen(false)}
        onSwitchToStudioMode={handleSwitchToStudioAndGenerate}
        onRetryWithApiKey={(key) => {
          saveGeminiApiKey(key);
          setUserApiKeyInput(key);
          setIsQuotaExceeded(false);
          setIsQuotaModalOpen(false);
          handleStartFitting();
        }}
      />
    </div>
  );
};

export default UnifiedFittingFlow;
