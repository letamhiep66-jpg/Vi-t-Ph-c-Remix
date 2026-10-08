import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CameraFlowModal } from '../mix/CameraFlowModal';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { 
  Upload, 
  Camera, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  FileText, 
  Sliders, 
  Share2, 
  Trash2, 
  Eye, 
  Compass, 
  MessageSquare,
  HelpCircle,
  ExternalLink,
  History,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';

export interface EvaluationResult {
  overallScore: number;
  rankTitle: string;
  summary: string;
  identifiedCostume: {
    name: string;
    dynasty: string;
    primaryColor: string;
    fabricPatternNote: string;
  };
  dimensions: {
    harmony: { score: number; comment: string };
    authenticity: { score: number; comment: string };
    accessories: { score: number; comment: string };
    occasionFit: { score: number; comment: string };
  };
  strengths: string[];
  improvements: string[];
  recommendations: {
    accessoriesToTry: string[];
    suitableVenues: string[];
    stylingTip: string;
  };
}

const OCCASIONS = [
  'Lễ cưới truyền thống',
  'Lễ Tết / Chúc thọ đầu năm',
  'Chụp ảnh di tích / Kỷ yếu',
  'Lễ hội / Dạo phố truyền thống',
  'Dạ tiệc văn hóa trang trọng',
  'Đi làm / Sự kiện công sở',
  'Khác / Đánh giá tự do'
];

const HERITAGE_VENUES = [
  'Hoàng Thành Thăng Long (Hà Nội)',
  'Đại Nội Cố Đô Huế',
  'Phố Cổ Hội An (Quảng Nam)',
  'Văn Miếu - Quốc Tử Giám (Hà Nội)',
  'Làng Cổ Đường Lâm (Hà Nội)',
  'Tràng An - Cố Đô Hoa Lư (Ninh Bình)',
  'Đền chùa / Không gian di sản khác'
];

export const OutfitCritiqueSection: React.FC = () => {
  const { setActiveTab, openChatWithContext } = useApp();

  // State quản lý ảnh
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');

  // State phân tích
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Lịch sử thẩm định
  const [historyList, setHistoryList] = useState<{ id: string; timestamp: number; image: string; result: EvaluationResult }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nep_outfit_evaluations_v1');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Xử lý upload ảnh từ máy tính / điện thoại
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn một tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh tối đa là 20MB. Vui lòng chọn ảnh dung lượng nhỏ hơn.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setEvaluation(null); // Reset kết quả cũ
    };
    reader.readAsDataURL(file);
  };

  // Tiến hành chấm điểm qua AI
  const handleEvaluate = async () => {
    if (!selectedImage) {
      setErrorMessage('Vui lòng tải ảnh lên hoặc chọn một ảnh mẫu để tiến hành chấm điểm.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep(1);

    // Hiệu ứng các bước phân tích mỹ học
    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 1200);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 2400);

    try {
      const response = await fetch('/api/gemini/evaluate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          occasion: selectedOccasion,
          location: selectedLocation,
          userNote
        })
      });

      const data = await response.json();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setIsAnalyzing(false);

        // Lưu vào lịch sử
        try {
          const newEntry = {
            id: 'eval-' + Date.now(),
            timestamp: Date.now(),
            image: selectedImage,
            result: data.evaluation
          };
          const updated = [newEntry, ...historyList.slice(0, 5)];
          setHistoryList(updated);
          localStorage.setItem('nep_outfit_evaluations_v1', JSON.stringify(updated));
        } catch {
          // Ignore storage quota
        }

        // Tự động cuộn xuống phần kết quả
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(data.error || 'Không thể hoàn tất thẩm định trang phục.');
      }
    } catch (err: any) {
      setIsAnalyzing(false);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMessage(err.message || 'Đã có lỗi xảy ra trong quá trình kết nối AI. Vui lòng thử lại.');
    }
  };

  // Chia sẻ / Copy tóm tắt kết quả
  const handleShare = () => {
    if (!evaluation) return;
    const shareText = `Điểm số Thẩm định Việt Phục Nếp AI: ${evaluation.overallScore}/100 [${evaluation.rankTitle}]\nLoại trang phục: ${evaluation.identifiedCostume.name}\n${evaluation.summary}`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Tiêu đề & Giới thiệu tính năng */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold mb-3 shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#9B2226]" />
          <span>Hội Đồng Thẩm Định & Chấm Điểm Việt Phục AI</span>
        </div>

        <h1 className="font-heritage text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E1713] tracking-tight">
          Chấm Điểm Bộ Đồ Tự Phối & Tự Thiết Kế
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6C584C] max-w-2xl mx-auto leading-relaxed">
          Tải ảnh bộ Việt phục do bạn tự phối hoặc tự thiết kế. AI sẽ phân tích chuyên sâu 4 trụ cột mỹ học di sản: <strong>Độ hài hòa</strong>, <strong>Chuẩn mực điển chế</strong>, <strong>Phối phụ kiện</strong> và <strong>Độ phù hợp dịp mặc</strong>.
        </p>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-red-600 hover:text-red-900 font-bold ml-2 text-xs"
          >
            Đóng
          </button>
        </div>
      )}

      {/* KHUNG THAO TÁC: UPLOAD ẢNH & CHỌN NGỮ CẢNH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Cột trái: Khung tải ảnh / Camera */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-[#DFD1BD] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1E1713] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#9B2226]" />
              <span>1. Tải Lên Hoặc Chụp Ảnh Bộ Đồ</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF6F0] hover:bg-[#EFE7DC] text-[#4A3E35] border border-[#DFD1BD] transition-all flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5 text-[#9B2226]" />
                <span className="hidden sm:inline">Chọn tệp</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#800E13] hover:bg-[#9B2226] text-white transition-all flex items-center gap-1 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Chụp ảnh</span>
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            /* Vùng kéo thả upload */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-[#DFD1BD] hover:border-[#9B2226] bg-[#FAF6F0]/60 hover:bg-[#FAF6F0] rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[300px] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#DFD1BD] flex items-center justify-center text-[#9B2226] shadow-xs mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#1E1713]">
                Kéo thả ảnh bộ đồ vào đây hoặc nhấn để duyệt tệp
              </p>
              <p className="text-xs text-[#786454] mt-1.5 max-w-xs">
                Chấp nhận tệp ảnh JPG, PNG, WEBP từ điện thoại hoặc máy tính
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <span className="px-4 py-2 bg-[#9B2226] hover:bg-[#800E13] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ máy</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCameraModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#DFD1BD] text-[#4A3E35] text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-[#9B2226]" />
                  <span>Mở camera chụp</span>
                </button>
              </div>
            </div>
          ) : (
            /* Xem trước ảnh đã chọn */
            <div className="relative rounded-2xl overflow-hidden border border-[#DFD1BD] bg-stone-900 group">
              <img
                src={selectedImage}
                alt="Trang phục cần thẩm định"
                className="w-full max-h-[380px] object-contain mx-auto"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ảnh đã sẵn sàng</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
                  title="Thay ảnh khác"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đổi ảnh</span>
                </button>
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
                  title="Chụp lại bằng camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chụp lại</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setEvaluation(null);
                  }}
                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-sm transition-all"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hướng dẫn chụp & tải ảnh tối ưu */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E9DFD1] text-xs text-[#55473D] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#1E1713]">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Gợi ý để AI nhận diện & chấm điểm chuẩn xác nhất:</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-[11px] text-[#6C584C]">
              <li>Chụp toàn thân hoặc 3/4 người trong môi trường đủ ánh sáng.</li>
              <li>Thấy rõ đường viền cổ áo (lập lĩnh, giao lĩnh, viên lĩnh...), vạt áo và khuy cúc.</li>
              <li>Đeo/cầm kèm phụ kiện nếu có (khăn vấn, kiềng bạc, hài thêu, nón, quạt) để được chấm trọn bộ.</li>
            </ul>
          </div>
        </div>

        {/* Cột phải: Ngữ cảnh dịp mặc & Nút chấm điểm */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#DFD1BD] shadow-sm space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[#1E1713] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#9B2226]" />
              <span>2. Chọn Ngữ Cảnh Bổ Trợ (Tùy Chọn)</span>
            </h2>

            {/* Dịp mặc */}
            <div>
              <label className="block text-xs font-bold text-[#4A3E35] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9B2226]" />
                <span>Dịp Mặc / Sự Kiện Dự Kiến:</span>
              </label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#DFD1BD] rounded-xl text-xs sm:text-sm text-[#1E1713] focus:outline-none focus:ring-2 focus:ring-[#9B2226]"
              >
                <option value="">-- Đánh giá tổng quát (Không phân biệt dịp) --</option>
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            {/* Địa điểm di sản */}
            <div>
              <label className="block text-xs font-bold text-[#4A3E35] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9B2226]" />
                <span>Địa Điểm / Không Gian Check-in Di Sản:</span>
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#DFD1BD] rounded-xl text-xs sm:text-sm text-[#1E1713] focus:outline-none focus:ring-2 focus:ring-[#9B2226]"
              >
                <option value="">-- Tự do / Đánh giá đa dạng không gian --</option>
                {HERITAGE_VENUES.map((venue) => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
            </div>

            {/* Ghi chú thêm với nhập liệu giọng nói */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4A3E35] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#9B2226]" />
                  <span>Ghi Chú Hoặc Ý Tưởng Thiết Kế (Nếu Có):</span>
                </label>
                <VoiceInputButton
                  onTranscript={(text) => setUserNote((prev) => (prev ? `${prev} ${text}` : text))}
                  placeholderPrompt="Nói ý tưởng: Áo gấm phối chân váy đen, dự cưới bạn..."
                  size="sm"
                />
              </div>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Ví dụ: Bộ này tôi tự may phối áo tấc với chân váy dập ly hiện đại, đeo thêm chuỗi hạt ngọc trai..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#DFD1BD] rounded-xl text-xs sm:text-sm text-[#1E1713] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9B2226]"
              />
            </div>

            {/* 4 Tiêu chí thẩm định mô tả ngắn */}
            <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E9DFD1] text-[11px] text-[#55473D] space-y-1">
              <span className="font-bold text-[#1E1713] block mb-1">Hội đồng AI chấm điểm theo 4 tiêu chí:</span>
              <p>• <strong>Hài hòa thẩm mỹ:</strong> Phom dáng, độ rủ của tà áo, phối màu sắc ngũ hành.</p>
              <p>• <strong>Chuẩn mực điển chế:</strong> Cổ áo (lập/giao/viên lĩnh), cách khép tà, khuy cài, tay áo.</p>
              <p>• <strong>Phối phụ kiện:</strong> Khăn vấn, nón quai thao/nón lá, kiềng bạc, hài thêu, quạt.</p>
              <p>• <strong>Phù hợp bối cảnh:</strong> Mức độ tương thích với sự kiện và danh thắng di sản.</p>
            </div>

            {/* Nút hành động chính */}
            <button
              onClick={handleEvaluate}
              disabled={isAnalyzing || !selectedImage}
              className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAnalyzing || !selectedImage
                  ? 'bg-stone-400 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-[#800E13] to-[#9B2226] hover:from-[#6E0B10] hover:to-[#800E13] hover:shadow-lg'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {analysisStep === 1 && 'Đang nhận diện phom dáng & loại trang phục...'}
                    {analysisStep === 2 && 'Đang đối chiếu điển chế lịch sử & phụ kiện...'}
                    {analysisStep === 3 && 'Đang tổng hợp điểm số & lập nhận xét...'}
                  </span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  <span>Thẩm Định & Chấm Điểm Bộ Trang Phục</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Camera nếu người dùng chọn chụp trực tiếp */}
      {isCameraModalOpen && (
        <CameraFlowModal
          onComplete={(userPhotoUrl) => {
            setSelectedImage(userPhotoUrl);
            setEvaluation(null);
            setIsCameraModalOpen(false);
          }}
          onClose={() => setIsCameraModalOpen(false)}
        />
      )}

      {/* Luxury Minimalist Analysis Progress Card */}
      {isAnalyzing && (
        <div className="bg-white/95 rounded-3xl border border-[#DFD1BD] shadow-lg p-6 sm:p-8 text-center max-w-xl mx-auto my-6 space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full border border-[#DFD1BD] bg-[#FAF6F0] mx-auto flex items-center justify-center text-[#800E13]">
            <Sparkles className="w-5 h-5 animate-soft-pulse" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[#2C241D]">
              {analysisStep === 1 && 'Đang nhận diện phom dáng & loại trang phục...'}
              {analysisStep === 2 && 'Đang đối chiếu điển chế lịch sử & phụ kiện...'}
              {analysisStep === 3 && 'Đang tổng hợp điểm số & lập kiến giải...'}
            </h4>
            <p className="text-xs text-[#786454] mt-1 max-w-md mx-auto">
              {analysisStep === 1 && 'Phân tích đường may, cổ áo (lập/giao lĩnh), tay áo và cấu trúc khuy cài'}
              {analysisStep === 2 && 'Khảo cứu thư tịch di sản, sự tương thích ngũ hành và phụ kiện đi kèm'}
              {analysisStep === 3 && 'Hoàn thiện bảng điểm chi tiết và gợi ý cải thiện phong cách đương đại'}
            </p>
          </div>

          <div className="w-full max-w-xs mx-auto space-y-2 pt-2">
            <div className="h-1.5 w-full bg-[#EFE6D8] rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-[#800E13] via-[#B22222] to-[#C5A880] rounded-full transition-all duration-500 relative"
                style={{ width: `${analysisStep === 1 ? 35 : analysisStep === 2 ? 70 : 92}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-shimmer" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A89887] font-medium px-0.5">
              <span>Giai đoạn {analysisStep}/3</span>
              <span className="font-semibold text-[#800E13] tabular-nums">
                {analysisStep === 1 ? '35%' : analysisStep === 2 ? '70%' : '92%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          KẾT QUẢ THẨM ĐỊNH CHI TIẾT
          ========================================================================= */}
      {evaluation && (
        <div ref={resultRef} className="space-y-6 animate-in fade-in duration-500">
          {/* Card Tổng quan Điểm số */}
          <div className="bg-gradient-to-br from-white via-[#FCF8F2] to-amber-50/40 p-6 sm:p-8 rounded-3xl border-2 border-[#D4A373]/50 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-stone-200">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Vòng tròn điểm số ấn tượng */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#800E13] to-[#9B2226] text-white flex flex-col items-center justify-center shadow-xl ring-4 ring-amber-300/60 shrink-0">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {evaluation.overallScore}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-200">
                    / 100 Điểm
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800E13] text-white text-xs font-bold mb-2 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{evaluation.rankTitle}</span>
                  </div>
                  <h3 className="font-heritage text-xl sm:text-2xl font-bold text-[#1E1713]">
                    {evaluation.identifiedCostume.name}
                  </h3>
                  <p className="text-xs text-[#6C584C] mt-1">
                    Niên đại: <strong>{evaluation.identifiedCostume.dynasty}</strong> • Tông màu: <strong>{evaluation.identifiedCostume.primaryColor}</strong>
                  </p>
                  <p className="text-xs text-[#55473D] mt-2 italic max-w-xl leading-relaxed">
                    "{evaluation.summary}"
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#9B2226]" />
                  <span>{copiedLink ? 'Đã sao chép!' : 'Chia sẻ điểm'}</span>
                </button>

                <button
                  onClick={() => openChatWithContext(`Bộ trang phục ${evaluation.identifiedCostume.name} của tôi được chấm ${evaluation.overallScore} điểm. Xin hãy tư vấn thêm cách phối đồ và nâng cấp phụ kiện.`)}
                  className="px-4 py-2 bg-[#9B2226] hover:bg-[#800E13] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Hỏi Nếp AI</span>
                </button>
              </div>
            </div>

            {/* BẢNG ĐIỂM 4 CHIỀU KÍCH CỐT LÕI */}
            <div className="mt-6 pt-2">
              <h4 className="text-sm font-bold text-[#1E1713] mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#9B2226]" />
                <span>Bảng Điểm Chi Tiết 4 Tiêu Chí Thẩm Định</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Hài hòa thẩm mỹ & Phom dáng */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      1. Hài Hòa Thẩm Mỹ & Phom Dáng
                    </span>
                    <span className="text-xs font-extrabold text-[#9B2226] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      {evaluation.dimensions.harmony.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-[#9B2226] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${evaluation.dimensions.harmony.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#55473D] leading-relaxed">
                    {evaluation.dimensions.harmony.comment}
                  </p>
                </div>

                {/* 2. Chuẩn mực lịch sử & Điển chế */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      2. Chuẩn Mực Lịch Sử & Điển Chế
                    </span>
                    <span className="text-xs font-extrabold text-[#9B2226] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      {evaluation.dimensions.authenticity.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-700 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${evaluation.dimensions.authenticity.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#55473D] leading-relaxed">
                    {evaluation.dimensions.authenticity.comment}
                  </p>
                </div>

                {/* 3. Phối phụ kiện & Chi tiết */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      3. Phối Phụ Kiện & Chi Tiết
                    </span>
                    <span className="text-xs font-extrabold text-[#9B2226] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      {evaluation.dimensions.accessories.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-700 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${evaluation.dimensions.accessories.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#55473D] leading-relaxed">
                    {evaluation.dimensions.accessories.comment}
                  </p>
                </div>

                {/* 4. Mức độ phù hợp dịp mặc & Bối cảnh */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      4. Phù Hợp Dịp Mặc & Bối Cảnh
                    </span>
                    <span className="text-xs font-extrabold text-[#9B2226] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      {evaluation.dimensions.occasionFit.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-[#800E13] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${evaluation.dimensions.occasionFit.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#55473D] leading-relaxed">
                    {evaluation.dimensions.occasionFit.comment}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ĐIỂM SÁNG & ĐIỂM CẦN CẢI THIỆN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Điểm sáng */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs">
              <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Điểm Sáng Đáng Khen Ngợi</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#3E3833]">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lưu ý cải thiện */}
            <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs">
              <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Gợi Ý Tinh Chỉnh & Hoàn Thiện</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#3E3833]">
                {evaluation.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 font-bold">✦</span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* GỢI Ý ĐỊA ĐIỂM & PHỤ KIỆN TIẾP THEO */}
          <div className="bg-white p-6 rounded-3xl border border-[#DFD1BD] shadow-sm">
            <h4 className="text-sm font-bold text-[#1E1713] mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#9B2226]" />
              <span>Gợi Ý Nâng Tầm Trang Phục Của Chuyên Gia Nếp</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Phụ kiện nên thử */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E9DFD1]">
                <p className="text-xs font-bold text-[#800E13] mb-2 flex items-center gap-1.5">
                  <span>📿 Phụ kiện nên bổ sung:</span>
                </p>
                <div className="space-y-1.5">
                  {evaluation.recommendations.accessoriesToTry.map((acc, i) => (
                    <p key={i} className="text-xs text-[#4A3E35] flex items-center gap-1.5">
                      <span className="text-[#800E13]">•</span>
                      <span>{acc}</span>
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('mix')}
                  className="mt-3 text-[11px] font-bold text-[#800E13] hover:underline flex items-center gap-1"
                >
                  <span>Thử phối trong phòng Mix</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Địa điểm lý tưởng */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E9DFD1]">
                <p className="text-xs font-bold text-[#800E13] mb-2 flex items-center gap-1.5">
                  <span>🏛️ Không gian chụp lý tưởng:</span>
                </p>
                <div className="space-y-1.5">
                  {evaluation.recommendations.suitableVenues.map((ven, i) => (
                    <p key={i} className="text-xs text-[#4A3E35] flex items-center gap-1.5">
                      <span className="text-[#800E13]">•</span>
                      <span>{ven}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Mẹo tạo dáng */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E9DFD1]">
                <p className="text-xs font-bold text-[#800E13] mb-2 flex items-center gap-1.5">
                  <span>📸 Mẹo tạo dáng & phong thái:</span>
                </p>
                <p className="text-xs text-[#4A3E35] leading-relaxed">
                  {evaluation.recommendations.stylingTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LỊCH SỬ THẨM ĐỊNH GẦN ĐÂY */}
      {historyList.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1E1713] flex items-center gap-2">
              <History className="w-4 h-4 text-stone-500" />
              <span>Lịch Sử Thẩm Định Gần Đây Của Bạn ({historyList.length})</span>
            </h3>
            <button
              onClick={() => {
                setHistoryList([]);
                localStorage.removeItem('nep_outfit_evaluations_v1');
              }}
              className="text-xs text-stone-400 hover:text-stone-700 font-medium"
            >
              Xóa lịch sử
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedImage(item.image);
                  setEvaluation(item.result);
                  resultRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white p-3 rounded-2xl border border-stone-200 hover:border-[#9B2226] shadow-xs cursor-pointer transition-all flex items-center gap-3"
              >
                <img
                  src={item.image}
                  alt={item.result.identifiedCostume.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-900"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9B2226] bg-red-50 px-1.5 py-0.5 rounded">
                      {item.result.overallScore} điểm
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 truncate mt-1">
                    {item.result.identifiedCostume.name}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate">
                    {item.result.rankTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitCritiqueSection;
