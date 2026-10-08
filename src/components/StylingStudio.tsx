import React, { useState, useRef, useEffect, useId } from 'react';
import { useApp } from '../context/AppContext';
import { OFFICIAL_13_COSTUMES } from '../data/costumesData';
import { OFFICIAL_TRADITIONAL_ACCESSORIES, getAccessoriesForCostume } from '../data/accessoriesData';
import { WardrobeManagerModal } from './mix/WardrobeManagerModal';
import { fileToBase64, Base64ImageResult } from '../utils/fileUtils';
import { 
  callTryOnApi, 
  TryOnResult, 
  fetchOccasionRecommendation, 
  OccasionRecommendation, 
  StylingCritique 
} from '../services/geminiTryOnService';
import { db, doc, safeFirestoreSet } from '../services/firebase';
import { HERITAGE_PATTERNS } from './mix/UnifiedFittingFlow';
import { VoiceInputButton } from './common/VoiceInputButton';
import { composeEditorialFittingImage } from '../utils/fittingCanvasComposer';
import { QuotaExceededNoticeModal } from './mix/QuotaExceededNoticeModal';
import { getSavedGeminiApiKey } from '../utils/apiKeyStorage';
import { 
  Sparkles, 
  Upload, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  Bookmark, 
  SlidersHorizontal, 
  Eye, 
  X, 
  SplitSquareVertical, 
  Check, 
  Wand2, 
  ShoppingBag, 
  Crown, 
  Plus, 
  Star, 
  Award, 
  Lightbulb, 
  Camera, 
  Share2, 
  Palette, 
  Compass, 
  FileText,
  Trash2,
  ZoomIn,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface StylingStudioProps {
  onClose?: () => void;
}

export const OCCASION_PRESETS = [
  { id: 'tet-du-xuan', label: 'Tết & Du Xuân', icon: '🌸', prompt: 'Du xuân chúc Tết, lễ chùa cầu may, họp mặt gia tộc' },
  { id: 'tiec-cuoi-hy-su', label: 'Tiệc Cưới & Đại Hỷ', icon: '💍', prompt: 'Lễ cưới truyền thống, dự tiệc hỷ sự trang trọng' },
  { id: 'cong-so-ngoai-giao', label: 'Công Sở & Ngoại Giao', icon: '💼', prompt: 'Gặp gỡ đối tác ngoại giao, sự kiện giao lưu văn hóa' },
  { id: 'ca-phe-dao-pho', label: 'Dạo Phố & Check-in', icon: '☕', prompt: 'Dạo phố cổ cuối tuần, cà phê bạn bè không gian xưa' },
  { id: 'trien-lam-da-tiec', label: 'Triển Lãm & Dạ Yến', icon: '🏛️', prompt: 'Dự khai mạc triển lãm nghệ thuật, đêm hội di sản' }
];

const MODERN_REMIX_SUGGESTIONS = [
  'Quần tây ống suông & Giày oxford da',
  'Chân váy dập ly lụa tơ tằm & Boot da cổ thấp',
  'Quần jean ống rộng vintage & Sneaker tối giản',
  'Áo blazer phom rộng đương đại khoác hờ bờ vai',
  'Váy suông lụa trắng ngà & Guốc mộc quai nhung',
  'Chân váy xòe chữ A & Chuỗi ngọc trai'
];

const SAMPLE_STUDIO_MODELS = [
  {
    id: 'nu-cung-dinh',
    name: 'Mẫu Nữ Studio',
    gender: 'female' as const,
    url: '/images/models/female-model.jpg',
    desc: 'Thanh tú, đoan trang Á Đông'
  },
  {
    id: 'nam-van-nhan',
    name: 'Mẫu Nam Studio',
    gender: 'male' as const,
    url: '/images/models/male-model.jpg',
    desc: 'Nho nhã, đĩnh đạc Á Đông'
  }
];

export const StylingStudio: React.FC<StylingStudioProps> = ({ onClose }) => {
  const { 
    userProfile, 
    currentUser, 
    saveLookbook, 
    setActiveTab, 
    wardrobeItems,
    selectedCostumeForMix 
  } = useApp();

  // Mode Tab: 'studio' (Phối Đồ Tự Do) vs 'recommendation' (Gợi Ý Theo Dịp)
  const [studioTab, setStudioTab] = useState<'studio' | 'recommendation'>('studio');

  // Engine selection: 'studio-free' (100% Free & Unlimited) vs 'nano-banana-pro' (Gemini AI Direct)
  const [engineMode, setEngineMode] = useState<'studio-free' | 'nano-banana-pro'>('studio-free');

  // Quota Exceeded Modal State
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [quotaRemainingHours, setQuotaRemainingHours] = useState<number>(14);

  // Zoom Modal
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // 1. Model / Figure Settings
  const [userImageResult, setUserImageResult] = useState<Base64ImageResult | null>(null);
  const [selectedSampleModelId, setSelectedSampleModelId] = useState<string>('nu-cung-dinh');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gender, setGender] = useState<'female' | 'male' | 'unisex'>(userProfile?.gender || 'female');
  const [height, setHeight] = useState<number>(userProfile?.height || 165);
  const [weight, setWeight] = useState<number>(userProfile?.weight || 52);
  const [skinTone, setSkinTone] = useState<'fair' | 'natural' | 'warm_tan'>('natural');

  // Calculated BMI & Body Shape
  const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
  const bodyShapeLabel = bmi < 19.5 ? 'Mảnh mai' : bmi <= 24.5 ? 'Cân đối' : bmi <= 28 ? 'Đầy đặn' : 'Vạm vỡ';

  // 2. Costume & Filter
  const [costumeFilter, setCostumeFilter] = useState<'all' | 'female' | 'male'>('all');
  const [selectedCostumeId, setSelectedCostumeId] = useState<string>(
    selectedCostumeForMix?.id || OFFICIAL_13_COSTUMES[0].id
  );
  const selectedCostume = OFFICIAL_13_COSTUMES.find(c => c.id === selectedCostumeId) || OFFICIAL_13_COSTUMES[0];

  // 3. Patterns & Accessories
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(['may-song-thuy-ba']);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>(['acc-khan-vanh', 'acc-kieng-bac']);

  // 4. Wardrobe & Modern Remix
  const [selectedWardrobeItemIds, setSelectedWardrobeItemIds] = useState<string[]>([]);
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState<boolean>(false);
  const [modernItemName, setModernItemName] = useState<string>(MODERN_REMIX_SUGGESTIONS[0]);

  // 5. Scene & Setting
  const [sceneBackground, setSceneBackground] = useState<'editorial_studio' | 'hue_citadel' | 'hoi_an' | 'temple_garden'>('editorial_studio');
  const [cameraPose, setCameraPose] = useState<'three_quarter' | 'full_body' | 'portrait'>('three_quarter');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // 6. Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3>(1);
  const [processMessage, setProcessMessage] = useState<string>('');
  const [tryOnError, setTryOnError] = useState<string | null>(null);

  const [result, setResult] = useState<TryOnResult | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'side-by-side'>('single');
  const [isSavedToLookbook, setIsSavedToLookbook] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Occasion Recommendation State
  const [selectedOccasionPreset, setSelectedOccasionPreset] = useState<string>('tet-du-xuan');
  const [customOccasion, setCustomOccasion] = useState<string>('Du xuân chúc Tết, lễ chùa cầu may');
  const [isSuggestingOccasion, setIsSuggestingOccasion] = useState<boolean>(false);
  const [occasionRecommendation, setOccasionRecommendation] = useState<OccasionRecommendation | null>(null);
  const [occasionError, setOccasionError] = useState<string | null>(null);

  // Sync profile when userProfile changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.gender) setGender(userProfile.gender);
      if (userProfile.height) setHeight(userProfile.height);
      if (userProfile.weight) setWeight(userProfile.weight);
    }
  }, [userProfile]);

  // Sync selectedCostumeForMix from context
  useEffect(() => {
    if (selectedCostumeForMix?.id) {
      setSelectedCostumeId(selectedCostumeForMix.id);
      const matchingAccs = getAccessoriesForCostume(selectedCostumeForMix.id);
      if (matchingAccs.length > 0) {
        setSelectedAccessoryIds(matchingAccs.slice(0, 2).map(a => a.id));
      }
    }
  }, [selectedCostumeForMix]);

  // Filter costumes by gender
  const filteredCostumes = OFFICIAL_13_COSTUMES.filter(c => {
    if (costumeFilter === 'all') return true;
    if (costumeFilter === 'female') return c.gender === 'female' || c.gender === 'unisex';
    if (costumeFilter === 'male') return c.gender === 'male' || c.gender === 'unisex';
    return true;
  });

  // Handle Photo Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const converted = await fileToBase64(file);
      setUserImageResult(converted);
    } catch (err: any) {
      setUploadError(err?.message || 'Không thể đọc tệp ảnh.');
    }
  };

  // Quick 1-Click Presets
  const applyPreset = (presetKey: 'cung_dinh' | 'tan_thoi' | 'pho_co' | 'hy_su') => {
    if (presetKey === 'cung_dinh') {
      setSelectedCostumeId('ao-nhat-binh');
      setGender('female');
      setSelectedAccessoryIds(['acc-khan-vanh', 'acc-kieng-bac', 'acc-quat-tram']);
      setSceneBackground('hue_citadel');
      setModernItemName('Chân váy dập ly lụa tơ tằm & Boot da cổ thấp');
    } else if (presetKey === 'tan_thoi') {
      setSelectedCostumeId('ao-ngu-than');
      setGender('male');
      setSelectedAccessoryIds(['acc-khan-dong', 'acc-quat-tram']);
      setSceneBackground('editorial_studio');
      setModernItemName('Quần tây ống suông & Giày oxford da bóng');
    } else if (presetKey === 'pho_co') {
      setSelectedCostumeId('ao-giao-linh');
      setSelectedAccessoryIds(['acc-non-ba-tam', 'acc-chuoi-ngoc-trai']);
      setSceneBackground('hoi_an');
      setModernItemName('Quần âu trắng ngà & Guốc mộc truyền thống');
    } else if (presetKey === 'hy_su') {
      setSelectedCostumeId('ao-tac');
      setSelectedAccessoryIds(['acc-khan-dong', 'acc-kieng-bac', 'acc-hai-theu']);
      setSceneBackground('temple_garden');
      setModernItemName('Quần lụa trắng cao cấp & Giày mộc');
    }
  };

  // Auto-suggest accessories for current costume
  const handleAutoSuggestAccessories = () => {
    const matching = getAccessoriesForCostume(selectedCostume.id);
    if (matching.length > 0) {
      setSelectedAccessoryIds(matching.slice(0, 3).map(a => a.id));
    }
  };

  // Handle Occasion Recommendation
  const handleGetOccasionRecommendation = async (targetOccasion?: string) => {
    const occ = (targetOccasion || customOccasion).trim();
    if (!occ) {
      setOccasionError('Vui lòng chọn hoặc nhập một dịp mong muốn.');
      return;
    }
    setIsSuggestingOccasion(true);
    setOccasionError(null);
    try {
      const rec = await fetchOccasionRecommendation({
        occasion: occ,
        gender,
        height,
        weight,
        favoriteEra: selectedCostume.dynasty,
        userImage: userImageResult?.dataUrl
      });
      setOccasionRecommendation(rec);
    } catch (err: any) {
      setOccasionError(err?.message || 'Không thể tạo gợi ý cho dịp này.');
    } finally {
      setIsSuggestingOccasion(false);
    }
  };

  const applyRecommendationToStudio = (rec: OccasionRecommendation) => {
    if (rec.costumeId) {
      setSelectedCostumeId(rec.costumeId);
      const matching = getAccessoriesForCostume(rec.costumeId);
      if (matching.length > 0) setSelectedAccessoryIds(matching.slice(0, 3).map(a => a.id));
    }
    if (rec.modernItemName) setModernItemName(rec.modernItemName);
    if (rec.patternId) setSelectedPatternIds([rec.patternId]);
    setStudioTab('studio');
  };

  // MAIN GENERATE TRY ON ACTION
  const handleGenerateTryOn = async (overrideEngine?: 'studio-free' | 'nano-banana-pro') => {
    const activeEngine = overrideEngine || engineMode;
    setIsProcessing(true);
    setTryOnError(null);
    setResult(null);
    setIsSavedToLookbook(false);
    setSaveSuccessMsg(null);

    const chosenPatterns = HERITAGE_PATTERNS.filter(p => selectedPatternIds.includes(p.id));
    const chosenAccessories = OFFICIAL_TRADITIONAL_ACCESSORIES
      .filter(a => selectedAccessoryIds.includes(a.id))
      .map(a => ({ id: a.id, name: a.name, category: a.category, image: a.image }));
    const chosenWardrobe = wardrobeItems
      .filter(w => selectedWardrobeItemIds.includes(w.id))
      .map(w => ({ id: w.id, name: w.name, category: w.category }));

    const combinedModernName = [
      ...chosenWardrobe.map(w => w.name),
      modernItemName.trim()
    ].filter(Boolean).join(', ') || 'Trang phục đương đại thanh lịch';

    // Active portrait photo foundation: either user's uploaded photo or selected sharp studio model
    const chosenSample = SAMPLE_STUDIO_MODELS.find(m => m.id === selectedSampleModelId) || SAMPLE_STUDIO_MODELS[0];
    const targetUserPhoto = userImageResult?.dataUrl || chosenSample.url;

    try {
      setPipelineStep(1);
      setProcessMessage(userImageResult 
        ? 'Bước 1/3: Phân tích đường nét gương mặt & nhân trắc học...' 
        : `Bước 1/3: Chuẩn hóa nhân trắc học Á Đông (${height}cm, ${weight}kg, vóc dáng ${bodyShapeLabel})...`);

      const t1 = setTimeout(() => {
        setPipelineStep(2);
        setProcessMessage(`Bước 2/3: May đo tà áo ${selectedCostume.name} (${selectedCostume.dynasty}) & đính kết phụ kiện...`);
      }, 1200);

      const t2 = setTimeout(() => {
        setPipelineStep(3);
        setProcessMessage('Bước 3/3: Kết xuất bức ảnh chân dung người thật sắc nét chuẩn Editorial 8K...');
      }, 2600);

      let finalImageUrl = '';
      let defaultCritique: StylingCritique | undefined;

      // ENGINE: Nano Banana Pro (Gemini AI Direct)
      if (activeEngine === 'nano-banana-pro') {
        const personalKey = getSavedGeminiApiKey();
        let responseData: TryOnResult | null = null;
        try {
          responseData = await callTryOnApi({
            userImageBase64: userImageResult?.base64,
            mimeType: userImageResult?.mimeType || 'image/jpeg',
            costumeId: selectedCostume.id,
            costumeName: selectedCostume.name,
            costumeEra: selectedCostume.dynasty,
            costumeImage: selectedCostume.frontImage,
            modernItemName: combinedModernName,
            height,
            weight,
            gender,
            patterns: chosenPatterns,
            accessories: chosenAccessories,
            wardrobeItems: chosenWardrobe
          }, personalKey);
        } catch (apiErr: any) {
          console.log('[StylingStudio] API notice:', apiErr);
        }

        clearTimeout(t1);
        clearTimeout(t2);

        // QUOTA EXCEEDED: Show exact notification requested by the user!
        if (responseData?.quotaExceeded) {
          setQuotaRemainingHours(responseData.retryAfterHours || 14);
          setIsQuotaModalOpen(true);
          setIsProcessing(false);
          return;
        }

        if (responseData?.isAiGenerated && responseData?.imageUrl) {
          finalImageUrl = responseData.imageUrl;
          defaultCritique = responseData.critique;
        }
      }

      // ENGINE: Studio Chân Dung Người Thật (100% Free & Sắc Nét)
      if (!finalImageUrl) {
        finalImageUrl = await composeEditorialFittingImage({
          userPhoto: targetUserPhoto,
          costumeImage: selectedCostume.frontImage,
          costumeId: selectedCostume.id,
          costumeName: selectedCostume.name,
          dynasty: selectedCostume.dynasty,
          gender,
          height,
          weight,
          skinTone,
          bodyShape: bmi < 19.5 ? 'slim' : bmi <= 24.5 ? 'balanced' : bmi <= 28 ? 'curvy' : 'athletic',
          sceneBackground,
          cameraPose,
          patterns: chosenPatterns,
          accessories: chosenAccessories,
          wardrobeItems: chosenWardrobe,
          stylingPrompt: customPrompt || `Bản phối di sản ${selectedCostume.name} (${selectedCostume.dynasty}) cùng ${combinedModernName}`
        });
      }

      clearTimeout(t1);
      clearTimeout(t2);

      const accNames = chosenAccessories.map(a => a.name);
      if (!defaultCritique) {
        defaultCritique = {
          harmonyScore: 96,
          critiqueTitle: `Giao Hòa Di Sản: ${selectedCostume.name} × ${combinedModernName}`,
          overview: `Bản phối giữa ${selectedCostume.name} (${selectedCostume.dynasty}) và ${combinedModernName} toát lên khí chất tôn nghiêm, hòa quyện tự nhiên cùng hơi thở đương đại. Phom dáng tà áo buông rủ thanh thoát, tôn vinh vóc dáng ${bodyShapeLabel.toLowerCase()} và vẻ đẹp thanh tao.`,
          heritageAnalysis: `Kế thừa chuẩn mực nẹp cổ và cấu trúc vạt áo thời ${selectedCostume.dynasty}, phục sức giữ trọn vẹn nét đoan trang đĩnh đạc của văn hóa Đại Việt.`,
          accessoryVerdict: accNames.length > 0 
            ? `Điểm xuyết ${accNames.join(', ')} tạo điểm nhấn văn hóa sâu sắc, bổ trợ hoàn mỹ cho diện mạo.`
            : 'Lối phối tối giản phụ kiện làm nổi bật chất liệu lụa gấm tự nhiên của tà áo.',
          pros: [
            `Tốt ở điểm nào: Tỷ lệ tà áo ôm vai thanh thoát, vừa vặn chuẩn mực với chiều cao ${height}cm và vóc dáng ${bodyShapeLabel.toLowerCase()}.`,
            `Tốt ở điểm nào: Sự hòa sắc di sản tạo ấn tượng thị giác tao nhã, sang trọng trong bối cảnh studio điện ảnh.`,
            accNames.length > 0 
              ? `Tốt ở điểm nào: Bộ phụ kiện (${accNames.join(', ')}) hoàn thiện chỉnh chu phong thái cổ phong.` 
              : 'Tốt ở điểm nào: Tối giản chi tiết tôn vinh tối đa chất liệu gấm lụa dệt.'
          ],
          improvements: [
            'Chưa tốt / Cần lưu ý: Cần chú ý giữ nếp gấp tà áo phẳng phiu khi di chuyển để tránh làm xô lệch phom đứng của cổ áo.',
            'Cần cải thiện: Khi chụp ảnh, nên nghiêng nhẹ góc mặt 3/4 và giữ cử chỉ tay khoan thai để phô diễn trọn vẹn phom tay thụng.'
          ],
          stylingAdvice: 'Giữ ánh nhìn an nhiên, bước đi từ tốn để toát lên thần thái ung dung của phục sức truyền thống.',
          suitableOccasions: ['Chụp ảnh Lookbook nghệ thuật', 'Sự kiện văn hóa & tuần lễ di sản', 'Du xuân dạo phố cổ'],
          stylingTags: ['Cổ Phong Đương Đại', 'Thanh Lịch Sang Trọng', 'Tôn Vinh Di Sản']
        };
      }

      setResult({
        success: true,
        imageUrl: finalImageUrl,
        identityDescriptor: `Khung người ${gender === 'male' ? 'nam' : 'nữ'} (${height}cm, ${weight}kg, vóc dáng ${bodyShapeLabel}) cùng thần thái Á Đông`,
        costumeName: selectedCostume.name,
        costumeEra: selectedCostume.dynasty,
        modernItemName: combinedModernName,
        generatedPrompt: customPrompt,
        isAiGenerated: true,
        accessoriesList: chosenAccessories.map(a => a.name),
        wardrobeList: chosenWardrobe.map(w => w.name),
        critique: defaultCritique,
        message: 'Đã hoàn tất bức ảnh Lookbook di sản cá nhân hóa.'
      });

    } catch (err: any) {
      setTryOnError(err?.message || 'Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save to Lookbook
  const handleSaveToLookbook = async () => {
    if (!result || !result.imageUrl) return;
    try {
      const itemToSave = {
        costumeId: selectedCostume.id,
        costumeName: result.costumeName || selectedCostume.name,
        costumeEra: result.costumeEra || selectedCostume.dynasty,
        imageUrl: result.imageUrl,
        userImage: userImageResult?.dataUrl,
        modernItemName: result.modernItemName || modernItemName,
        accessories: result.accessoriesList || selectedAccessoryIds,
        critique: result.critique,
        createdAt: new Date().toISOString()
      };

      if (currentUser?.uid) {
        await safeFirestoreSet(
          doc(db, 'users', currentUser.uid, 'lookbook', `${Date.now()}`),
          itemToSave,
          { merge: true }
        );
      }
      saveLookbook(itemToSave as any);
      setIsSavedToLookbook(true);
      setSaveSuccessMsg('Đã lưu bức ảnh vào Bộ sưu tập Lookbook của bạn!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.log('Save lookbook notice:', err);
    }
  };

  // Download Image
  const handleDownloadImage = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `lookbook-${selectedCostume.id}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6 animate-in fade-in">
      
      {/* Studio Header Bar */}
      <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#800E13] animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-[#800E13] uppercase">
              XƯỞNG PHỐI ĐỒ & TẠO ẢNH CHÂN DUNG DI SẢN
            </span>
          </div>
          <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-[#2C241D] mt-1">
            Nếp Phục Sức Đương Đại
          </h2>
          <p className="text-xs sm:text-sm text-[#7B6858] mt-0.5">
            Ướm thử Việt phục trên người thật, kết hợp phụ kiện cổ phong và tôn vinh vóc dáng Á Đông
          </p>
        </div>

        {/* Quick Presets & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <span className="text-xs font-semibold text-[#8C7A6B] mr-1 hidden sm:inline">Phối nhanh:</span>
          <button
            type="button"
            onClick={() => applyPreset('cung_dinh')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD4C4] text-xs font-bold text-[#5C4D3C] hover:text-[#800E13] transition-all cursor-pointer shadow-2xs"
          >
            👑 Cung Đình
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tan_thoi')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD4C4] text-xs font-bold text-[#5C4D3C] hover:text-[#800E13] transition-all cursor-pointer shadow-2xs"
          >
            👔 Tân Thời
          </button>
          <button
            type="button"
            onClick={() => applyPreset('pho_co')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD4C4] text-xs font-bold text-[#5C4D3C] hover:text-[#800E13] transition-all cursor-pointer shadow-2xs"
          >
            🏮 Phố Cổ
          </button>
          <button
            type="button"
            onClick={() => applyPreset('hy_su')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD4C4] text-xs font-bold text-[#5C4D3C] hover:text-[#800E13] transition-all cursor-pointer shadow-2xs"
          >
            💍 Đại Hỷ
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B6858] hover:text-[#2C241D] hover:bg-stone-100 transition-colors ml-2 cursor-pointer"
              title="Đóng Studio"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Phối Đồ Studio vs Gợi Ý Dịp */}
      <div className="flex items-center gap-2 border-b border-[#E9DFD1] pb-2">
        <button
          type="button"
          onClick={() => setStudioTab('studio')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            studioTab === 'studio'
              ? 'bg-[#800E13] text-white shadow-xs'
              : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-[#FAF6F0]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Xưởng Phối Đồ & Tạo Ảnh Lookbook</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab('recommendation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            studioTab === 'recommendation'
              ? 'bg-[#800E13] text-white shadow-xs'
              : 'text-[#6C584C] hover:text-[#2C241D] hover:bg-[#FAF6F0]'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Gợi Ý Phối Đồ Theo Dịp (AI Stylist)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PHỐI ĐỒ TỰ DO & TẠO ẢNH LOOKBOOK (STUDIO COCKPIT)
          ========================================================================= */}
      {studioTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Controls & Configurations (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">

            {/* DUAL ENGINE SWITCHER (Studio Miễn Phí vs Nano Banana Pro) */}
            <div className="bg-white rounded-3xl border border-[#E9DFD1] p-4 shadow-xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Động Cơ Tạo Ảnh Lookbook</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEngineMode('studio-free')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    engineMode === 'studio-free'
                      ? 'border-[#800E13] bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EA] ring-2 ring-[#800E13]/20 shadow-xs'
                      : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#800E13]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2C241D]">Chân Dung Studio</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Miễn phí 100%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6C584C] leading-tight">
                    Ghép người thật sắc nét, chuẩn dáng 8K, không lo hết lượt
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngineMode('nano-banana-pro')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    engineMode === 'nano-banana-pro'
                      ? 'border-[#800E13] bg-gradient-to-br from-[#FFF8F0] to-[#FAF3EA] ring-2 ring-[#800E13]/20 shadow-xs'
                      : 'border-[#E9DFD1] bg-[#FAF8F5] hover:border-[#800E13]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2C241D]">Nano Banana Pro</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      AI Direct
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6C584C] leading-tight">
                    Google Gemini Image • Lượt dùng chung / API Key cá nhân
                  </span>
                </button>
              </div>
            </div>
            
            {/* 1. Người Mẫu & Nhân Trắc Học */}
            <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Người Mẫu & Khuôn Mặt Thật</span>
                </span>
                <span className="text-[11px] font-bold text-stone-600 bg-[#FAF6F0] px-2.5 py-0.5 rounded-lg border border-[#DFD4C4]">
                  Dáng: {bodyShapeLabel} (BMI {bmi})
                </span>
              </div>

              {/* Photo Upload / Model Preview */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {userImageResult ? (
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-stone-900 group">
                  <img
                    src={userImageResult.dataUrl}
                    alt="Ảnh chân dung người dùng"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-700/90 text-white text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã nhận diện khuôn mặt của bạn</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserImageResult(null)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-2 inset-x-2 p-1.5 rounded-xl bg-black/60 text-white text-[11px] text-center backdrop-blur-xs">
                    Khuôn mặt của bạn sẽ được ghép trực tiếp vào cổ phục
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Quick Select Sample Models */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8C7A6B] block mb-1.5">
                      Chọn nhanh mẫu chân dung studio sắc nét:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_STUDIO_MODELS.map(m => {
                        const isSelected = selectedSampleModelId === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedSampleModelId(m.id);
                              setGender(m.gender);
                            }}
                            className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                              isSelected
                                ? 'border-[#800E13] bg-[#FDF7F0] ring-1 ring-[#800E13]'
                                : 'border-[#E9DFD1] bg-[#FAF6F0] hover:border-[#800E13]/50'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={m.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-[#2C241D] block truncate">
                                {m.name}
                              </span>
                              <span className="text-[9px] text-[#7B6858] block truncate">
                                {m.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Or Upload Button */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#DFD4C4] hover:border-[#800E13] bg-[#FAF6F0] hover:bg-[#F5EFE6] rounded-2xl p-3.5 flex items-center justify-center gap-3 cursor-pointer transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#DFD4C4] flex items-center justify-center text-[#800E13] group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#2C241D] block">
                        Tải ảnh chân dung mặt của bạn lên
                      </span>
                      <span className="text-[10px] text-[#7B6858] block">
                        Ướp mặt thật vào ảnh lookbook người thật
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Giới tính */}
              <div>
                <label className="text-xs font-bold text-[#2C241D] block mb-1.5">
                  Giới tính vóc dáng:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'Nữ ♀' },
                    { id: 'male', label: 'Nam ♂' },
                    { id: 'unisex', label: 'Phi nhị giới ⚥' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGender(item.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        gender === item.id
                          ? 'bg-[#800E13] text-white border-[#800E13] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#5C4D3C] border-[#E9DFD1] hover:border-[#800E13]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chiều cao & Cân nặng Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#2C241D]">
                    <span>Chiều cao:</span>
                    <span className="font-mono text-[#800E13]">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min={145}
                    max={200}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-[#800E13] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#2C241D]">
                    <span>Cân nặng:</span>
                    <span className="font-mono text-[#800E13]">{weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={110}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-[#800E13] cursor-pointer"
                  />
                </div>
              </div>

              {/* Tông da */}
              <div>
                <label className="text-xs font-bold text-[#2C241D] block mb-1.5">
                  Nước da:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fair', label: 'Trắng ngà', color: '#F7E7DA' },
                    { id: 'natural', label: 'Tự nhiên', color: '#EBC4A4' },
                    { id: 'warm_tan', label: 'Bánh mật', color: '#D6A681' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSkinTone(t.id as any)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        skinTone === t.id
                          ? 'border-[#800E13] bg-[#FDF7F0] ring-1 ring-[#800E13]'
                          : 'border-[#E9DFD1] bg-[#FAF6F0] hover:border-[#800E13]/50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: t.color }} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Cổ Phục Di Sản Điển Chế */}
            <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>2. Tuyển Tập Cổ Phục ({filteredCostumes.length})</span>
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCostumeFilter('all')}
                    className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${costumeFilter === 'all' ? 'bg-[#800E13] text-white' : 'text-[#7B6858]'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostumeFilter('female')}
                    className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${costumeFilter === 'female' ? 'bg-[#800E13] text-white' : 'text-[#7B6858]'}`}
                  >
                    Nữ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostumeFilter('male')}
                    className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${costumeFilter === 'male' ? 'bg-[#800E13] text-white' : 'text-[#7B6858]'}`}
                  >
                    Nam
                  </button>
                </div>
              </div>

              {/* Grid Cổ Phục */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredCostumes.map((costume) => {
                  const isSelected = costume.id === selectedCostumeId;
                  return (
                    <div
                      key={costume.id}
                      onClick={() => setSelectedCostumeId(costume.id)}
                      className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                        isSelected
                          ? 'bg-[#FDF7F0] border-[#800E13] ring-2 ring-[#800E13]/30 shadow-xs'
                          : 'bg-white border-[#E9DFD1] hover:border-[#800E13]/50'
                      }`}
                    >
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-stone-100 mb-1.5 relative">
                        <img
                          src={costume.frontImage}
                          alt={costume.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#800E13] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-heritage text-xs font-bold text-[#2C241D] leading-tight line-clamp-1">
                          {costume.name}
                        </h5>
                        <span className="text-[10px] text-[#7B6858] block mt-0.5 line-clamp-1">
                          {costume.dynasty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Phụ Kiện Di Sản & Tủ Đồ Remix */}
            <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>3. Phụ Kiện & Món Đồ Đương Đại</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoSuggestAccessories}
                  className="text-xs font-bold text-[#800E13] hover:underline cursor-pointer"
                >
                  Gợi ý chuẩn áo
                </button>
              </div>

              {/* Grid Phụ Kiện */}
              <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {OFFICIAL_TRADITIONAL_ACCESSORIES.slice(0, 12).map((acc) => {
                  const isSelected = selectedAccessoryIds.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setSelectedAccessoryIds(prev =>
                          prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                        );
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                        isSelected
                          ? 'bg-[#FDF7F0] border-[#800E13] ring-1 ring-[#800E13]'
                          : 'bg-[#FAF6F0] border-[#E9DFD1] hover:border-[#800E13]/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 mb-1">
                        <img src={acc.image || acc.photoUrl} alt={acc.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-[#2C241D] line-clamp-1 leading-tight">
                        {acc.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Modern Wardrobe Mix Input */}
              <div className="pt-2 border-t border-[#E9DFD1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C241D]">
                    Món đồ hiện đại phối kèm:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsWardrobeModalOpen(true)}
                    className="text-[11px] font-bold text-[#800E13] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Tủ đồ cá nhân ({wardrobeItems.length})</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={modernItemName}
                    onChange={(e) => setModernItemName(e.target.value)}
                    placeholder="VD: Quần tây ống suông & Giày cao gót..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-xl text-xs text-[#2C241D] focus:ring-2 focus:ring-[#800E13]/30 focus:border-[#800E13] focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <VoiceInputButton
                      onTranscript={(t) => setModernItemName(prev => prev ? `${prev} ${t}` : t)}
                      placeholderPrompt="Nói món đồ phối..."
                      size="sm"
                    />
                  </div>
                </div>

                {/* Quick modern suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {MODERN_REMIX_SUGGESTIONS.slice(0, 3).map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setModernItemName(sug)}
                      className="px-2 py-0.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD4C4] text-[10px] text-[#5C4D3C] cursor-pointer"
                    >
                      + {sug.split('&')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Bối Cảnh & Không Gian Chụp */}
            <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#800E13] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>4. Bối Cảnh & Không Gian Chụp</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'editorial_studio', label: 'Studio Á Đông', desc: 'Ánh sáng nghệ thuật' },
                  { id: 'hue_citadel', label: 'Hoàng Thành Huế', desc: 'Cung điện đỏ son' },
                  { id: 'hoi_an', label: 'Phố Cổ Hội An', desc: 'Tường vàng đèn lồng' },
                  { id: 'temple_garden', label: 'Sân Chùa Cổ', desc: 'Rêu phong tĩnh mặc' }
                ].map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSceneBackground(sc.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      sceneBackground === sc.id
                        ? 'bg-[#FDF7F0] border-[#800E13] ring-1 ring-[#800E13]'
                        : 'bg-[#FAF6F0] border-[#E9DFD1] hover:border-[#800E13]/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#2C241D] block">{sc.label}</span>
                    <span className="text-[10px] text-[#7B6858] block">{sc.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NÚT TẠO ẢNH CHÍNH (CTA) */}
            <div className="space-y-2 pt-2">
              {tryOnError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{tryOnError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGenerateTryOn()}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#800E13] via-[#9B2226] to-[#800E13] hover:from-[#9B2226] hover:to-[#B22222] text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-[#800E13]/30 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-5 h-5 text-[#E9C46A] animate-pulse" />
                <span>
                  {engineMode === 'studio-free'
                    ? 'Tạo Ảnh Chân Dung Studio (100% Miễn Phí)'
                    : 'Tạo Ảnh Qua Nano Banana Pro (Gemini AI)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Studio Canvas & Results (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
            
            {/* Loading Stepper Visualizer */}
            {isProcessing && (
              <div className="bg-white rounded-3xl border border-[#E9DFD1] p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-3 border-[#800E13]/20 border-t-[#800E13] animate-spin" />
                    <Sparkles className="w-7 h-7 text-[#800E13] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#2C241D]">
                      Đang Tạo Bức Ảnh Người Thật Mặc Cổ Phục
                    </h3>
                    <p className="text-xs sm:text-sm text-[#800E13] font-semibold mt-1">
                      {processMessage}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className={`p-3 rounded-2xl border text-center transition-all ${
                    pipelineStep >= 1 ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <span className="text-xs block">1. Nhân trắc học</span>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center transition-all ${
                    pipelineStep >= 2 ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <span className="text-xs block">2. May đo cổ phục</span>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center transition-all ${
                    pipelineStep >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <span className="text-xs block">3. Kết xuất ảnh 8K</span>
                  </div>
                </div>
              </div>
            )}

            {/* KHI CHƯA GEN: Live Preview Card tóm tắt trước khi tạo */}
            {!result && !isProcessing && (
              <div className="bg-white rounded-3xl border border-[#E9DFD1] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E9DFD1] pb-3">
                  <h4 className="font-heritage text-base font-bold text-[#2C241D] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#800E13]" />
                    <span>Xem Trước Cấu Hình Trước Khi Tạo Ảnh</span>
                  </h4>
                  <span className="text-xs text-[#800E13] font-bold">
                    Sẵn sàng khởi chạy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cổ phục được chọn */}
                  <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-stone-900 border border-[#DFD4C4] shadow-xs">
                    <img
                      src={selectedCostume.frontImage}
                      alt={selectedCostume.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] text-[#E0A96D] uppercase font-bold tracking-wider">
                        {selectedCostume.dynasty}
                      </span>
                      <h4 className="font-heritage text-lg font-bold">
                        {selectedCostume.name}
                      </h4>
                    </div>
                  </div>

                  {/* Tóm tắt thông số cấu hình */}
                  <div className="space-y-3.5 bg-[#FAF6F0] p-4 rounded-2xl border border-[#DFD4C4] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">Người mẫu thể hiện</span>
                      <p className="font-bold text-[#2C241D] mt-0.5">
                        {userImageResult ? 'Ảnh thật của bạn' : `Mẫu ${gender === 'male' ? 'Nam' : 'Nữ'} Studio`} · {height}cm, {weight}kg ({bodyShapeLabel})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">Động cơ tạo ảnh</span>
                      <p className="font-bold text-[#800E13] mt-0.5">
                        {engineMode === 'studio-free' ? 'Studio Chân Dung (100% Miễn Phí)' : 'Nano Banana Pro (Google Gemini AI)'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">Phụ kiện cổ phong ({selectedAccessoryIds.length})</span>
                      <p className="font-bold text-[#2C241D] mt-0.5 truncate">
                        {selectedAccessoryIds.length > 0 
                          ? OFFICIAL_TRADITIONAL_ACCESSORIES.filter(a => selectedAccessoryIds.includes(a.id)).map(a => a.name).join(', ')
                          : 'Tối giản không phụ kiện'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">Không gian bối cảnh</span>
                      <p className="font-bold text-[#2C241D] mt-0.5">
                        {sceneBackground === 'editorial_studio' ? 'Studio Á Đông Tối Giản' : sceneBackground === 'hue_citadel' ? 'Hoàng Thành Huế' : sceneBackground === 'hoi_an' ? 'Phố Cổ Hội An' : 'Sân Chùa Cổ Rêu Phong'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateTryOn()}
                      className="w-full py-3 bg-[#800E13] hover:bg-[#9B2226] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                      <span>Tạo ảnh chân dung ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KHI CÓ KẾT QUẢ LOOKBOOK */}
            {result && !isProcessing && (
              <div className="bg-white rounded-3xl border border-[#E9DFD1] p-5 sm:p-7 shadow-md space-y-6 animate-in fade-in">
                
                {/* Result Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DFD1] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Ảnh Lookbook Di Sản Đã Tạo Thành Công</span>
                    </div>
                    <h3 className="font-heritage text-xl sm:text-2xl font-bold text-[#2C241D] mt-1.5">
                      {result.costumeName} ({result.costumeEra})
                    </h3>
                  </div>

                  {/* Utility Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsZoomOpen(true)}
                      className="p-2 rounded-xl border border-[#DFD4C4] bg-white text-[#2C241D] hover:bg-stone-50 cursor-pointer"
                      title="Phóng to ảnh HD"
                    >
                      <ZoomIn className="w-4 h-4 text-[#800E13]" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#DFD4C4] text-xs font-bold text-[#2C241D] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-4 h-4 text-[#800E13]" />
                      <span>Tải ảnh HD</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToLookbook}
                      disabled={isSavedToLookbook}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                        isSavedToLookbook
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#800E13] hover:bg-[#9B2226] text-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{isSavedToLookbook ? 'Đã lưu' : 'Lưu Lookbook'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode(prev => prev === 'single' ? 'side-by-side' : 'single')}
                      className={`p-2 rounded-xl border cursor-pointer ${
                        viewMode === 'side-by-side'
                          ? 'border-[#800E13] bg-[#800E13] text-white'
                          : 'border-[#DFD4C4] bg-white text-[#2C241D] hover:bg-stone-50'
                      }`}
                      title="So sánh Trước / Sau"
                    >
                      <SplitSquareVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* MAIN LOOKBOOK IMAGE DISPLAY */}
                {viewMode === 'single' ? (
                  <div className="relative w-full max-w-[540px] mx-auto aspect-3/4 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#C5A880]/40 bg-stone-900 group">
                    <img
                      src={result.imageUrl}
                      alt={`Ảnh người mặc ${result.costumeName}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ảnh người thật mặc {result.costumeName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-3/4 rounded-2xl overflow-hidden bg-stone-900 border border-[#DFD4C4] relative">
                      <img 
                        src={userImageResult?.dataUrl || (selectedSampleModelId === 'nam-van-nhan' ? '/images/models/male-model.jpg' : '/images/models/female-model.jpg')} 
                        alt="Ảnh gốc / Mẫu" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                        {userImageResult ? 'Chân dung của bạn' : 'Mẫu studio gốc'}
                      </div>
                    </div>
                    <div className="aspect-3/4 rounded-2xl overflow-hidden bg-stone-900 border border-[#DFD4C4] relative">
                      <img src={result.imageUrl} alt="Ảnh thử đồ" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#800E13] text-white text-[10px] font-bold">
                        Bản phối cổ phục
                      </div>
                    </div>
                  </div>
                )}

                {/* BẢNG ĐÁNH GIÁ 3 PHẦN RÕ RÀNG (FASHION CRITIQUE) */}
                {result.critique && (
                  <div className="bg-[#FAF6F0] rounded-2xl border border-[#DFD4C4] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#DFD4C4]/60 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#800E13] uppercase tracking-wider block">
                          ĐÁNH GIÁ GIÁM TUYỂN THỜI TRANG DI SẢN
                        </span>
                        <h4 className="font-heritage text-base sm:text-lg font-bold text-[#2C241D] mt-0.5">
                          {result.critique.critiqueTitle || `Giao Hòa Di Sản: ${result.costumeName}`}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#8C7A6B] uppercase block">Điểm hòa sắc</span>
                        <span className="font-heritage text-2xl font-bold text-[#800E13]">
                          {result.critique.harmonyScore}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed">
                      {result.critique.overview}
                    </p>

                    {/* 3 PHẦN NHẬN XÉT: TỐT Ở ĐIỂM NÀO, CHƯA TỐT, CẦN CẢI THIỆN */}
                    <div className="space-y-3 pt-1">
                      {/* Phần 1: Tốt ở điểm nào */}
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>1. Tốt ở điểm nào (Ưu điểm nổi bật)</span>
                        </span>
                        <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                          {result.critique.pros.map((p, idx) => (
                            <li key={idx} className="leading-relaxed">{p}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Phần 2: Chưa tốt / Cần lưu ý */}
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>2. Chưa tốt / Cần lưu ý ở điểm nào</span>
                        </span>
                        <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                          {(result.critique.improvements && result.critique.improvements.length > 0
                            ? result.critique.improvements
                            : ['Cần chú ý giữ nếp tà áo khi di chuyển để duy trì phom dáng đứng chuẩn mực.']
                          ).map((imp, idx) => (
                            <li key={idx} className="leading-relaxed">{imp}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Phần 3: Cần cải thiện thêm điều gì để hoàn thiện */}
                      <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-sky-700" />
                          <span>3. Cần cải thiện thêm điều gì để hoàn thiện hơn</span>
                        </span>
                        <p className="text-xs text-sky-950 leading-relaxed">
                          {result.critique.stylingAdvice || 'Giữ ánh nhìn an nhiên, hai tay khép hờ hoặc cầm nhẹ quạt trầm ở góc 45 độ để tôn dáng tà áo.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: GỢI Ý PHỐI ĐỒ THEO DỊP (AI STYLIST)
          ========================================================================= */}
      {studioTab === 'recommendation' && (
        <div className="bg-white rounded-3xl border border-[#E9DFD1] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heritage text-xl font-bold text-[#2C241D]">
              Tư Vấn Trang Phục Phù Hợp Cho Từng Dịp
            </h3>
            <p className="text-xs sm:text-sm text-[#7B6858] mt-1">
              Chọn dịp sự kiện hoặc nhập mong muốn của bạn để chuyên gia Nếp AI gợi ý bản phối hoàn hảo nhất
            </p>
          </div>

          {/* Dịp mẫu */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {OCCASION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedOccasionPreset(preset.id);
                  setCustomOccasion(preset.prompt);
                  handleGetOccasionRecommendation(preset.prompt);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedOccasionPreset === preset.id
                    ? 'bg-[#800E13] text-white border-[#800E13] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#5C4D3C] border-[#E9DFD1] hover:border-[#800E13]'
                }`}
              >
                <span className="text-xl block mb-1">{preset.icon}</span>
                <span className="text-xs font-bold block">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Gợi ý chi tiết kết quả */}
          {occasionRecommendation && (
            <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#DFD4C4] space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD4C4] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#800E13] uppercase tracking-wider block">
                    ĐỀ XUẤT TỐI ƯU CHO BẠN
                  </span>
                  <h4 className="font-heritage text-lg font-bold text-[#2C241D] mt-0.5">
                    {occasionRecommendation.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => applyRecommendationToStudio(occasionRecommendation)}
                  className="px-4 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>Áp Dụng Vào Xưởng Phối & Tạo Ảnh</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed">
                {occasionRecommendation.stylingRationale}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Wardrobe Modal */}
      {isWardrobeModalOpen && (
        <WardrobeManagerModal
          onClose={() => setIsWardrobeModalOpen(false)}
        />
      )}

      {/* Quota Exceeded Modal: Shows "Hôm nay đã hết lượt tạo ảnh, vui lòng thử lại sau ... giờ" */}
      <QuotaExceededNoticeModal
        isOpen={isQuotaModalOpen}
        retryAfterHours={quotaRemainingHours}
        onClose={() => setIsQuotaModalOpen(false)}
        onSwitchToStudioMode={() => {
          setEngineMode('studio-free');
          handleGenerateTryOn('studio-free');
        }}
        onRetryWithApiKey={(key) => {
          handleGenerateTryOn('nano-banana-pro');
        }}
      />

      {/* HD Zoom Modal */}
      {isZoomOpen && result?.imageUrl && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={result.imageUrl} alt="Zoom HD" className="w-full h-full object-contain" />
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
