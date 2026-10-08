import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MixOption, TraditionalCostume } from '../../types';
import { recommendOutfitsForEvent } from '../../services/costumeService';
import { CostumeDetailModal } from '../explore/CostumeDetailModal';
import { CostumeImage } from '../common/CostumeImage';
import { CameraFlowModal } from './CameraFlowModal';
import { VirtualFittingResultModal } from './VirtualFittingResultModal';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { Sparkles, Send, Camera, Info, CheckCircle2, ChevronRight, User } from 'lucide-react';

const EVENT_CHIPS = [
  'Dự đám cưới bạn thân tại resort Hội An',
  'Lễ tốt nghiệp cử nhân đại học',
  'Đi triển lãm nghệ thuật đương đại cuối tuần',
  'Dạo phố cổ Hà Nội và chụp ảnh mùa thu',
  'Dự dạ tiệc giao lưu văn hóa quốc tế'
];

export const EventMixFlow: React.FC = () => {
  const { effectiveStylingProfile, setLoadingState, setCanvasState, setMixSubflow } = useApp();
  const [eventInput, setEventInput] = useState<string>('Dự tiệc cưới bạn thân phong cách truyền thống');
  const [mixOptions, setMixOptions] = useState<MixOption[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [cardPhotoModes, setCardPhotoModes] = useState<Record<string, 'front' | 'top'>>({});

  // Modals for this flow
  const [selectedCostumeForDetail, setSelectedCostumeForDetail] = useState<TraditionalCostume | null>(null);
  const [cameraTargetOutfit, setCameraTargetOutfit] = useState<MixOption | null>(null);
  const [fittingResult, setFittingResult] = useState<{ outfit: MixOption; userPhoto: string } | null>(null);

  const handleViewOn2DStage = (opt: MixOption) => {
    setCanvasState(prev => ({
      ...prev,
      traditional: opt.costume,
      modern: opt.modernGarment,
      accessory: opt.accessories[0] || null,
      equippedLayers: {
        baseGender: opt.costume.gender === 'male' ? 'male' : 'female',
        outerTop: opt.costume,
        bottom: opt.modernGarment && ['pants', 'skirt'].includes(opt.modernGarment.category) ? opt.modernGarment : null,
        innerTop: null,
        accessoryFront: opt.accessories[0] || null,
        shoes: null,
      }
    }));
    setMixSubflow('free');
  };

  // Only generate when user explicitly clicks the button (or presses Enter)
  // No automatic generation on mount or chip selection per user requirement

  const handleGenerate = async (queryText = eventInput) => {
    if (!queryText.trim()) return;
    setIsGenerating(true);
    setLoadingState(true, 'Đang phân tích phom dáng cổ phục phù hợp cho bạn...');
    try {
      const results = await recommendOutfitsForEvent(queryText, effectiveStylingProfile as any);
      setMixOptions(results);
    } finally {
      setIsGenerating(false);
      setLoadingState(false);
    }
  };

  const handleCameraComplete = (userPhotoUrl: string) => {
    if (cameraTargetOutfit) {
      setFittingResult({
        outfit: cameraTargetOutfit,
        userPhoto: userPhotoUrl
      });
      setCameraTargetOutfit(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Event Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DFD1] shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-[#9B2226]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Phối Đồ Theo Bối Cảnh & Vóc Dáng
          </span>
        </div>
        <h2 className="font-heritage text-2xl font-bold text-[#2C241D]">
          Bạn chuẩn bị tham dự sự kiện gì?
        </h2>
        <p className="text-xs sm:text-sm text-[#6C584C] mt-1">
          Hệ thống sẽ đối chiếu với vóc dáng của bạn (cao {effectiveStylingProfile.height}cm, {effectiveStylingProfile.weight}kg) để gợi ý tà áo tôn vóc dáng nhất.
        </p>

        {/* Input & Action with Vietnamese Voice Recognition */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={eventInput}
              onChange={(e) => setEventInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="VD: Dự tiệc tối tại khách sạn, đi bảo tàng mỹ thuật..."
              className="w-full pl-4 pr-12 py-3.5 bg-[#FAF6F0] border border-[#DFD4C4] rounded-2xl text-sm text-[#2C241D] placeholder-[#9C8B7D] focus:outline-none focus:ring-2 focus:ring-[#9B2226]/30 focus:border-[#9B2226]"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
              <VoiceInputButton
                onTranscript={(text) => setEventInput(text)}
                placeholderPrompt="Nói sự kiện: Dự tiệc cưới, đi hội xuân, tốt nghiệp..."
                size="md"
              />
            </div>
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !eventInput.trim()}
            className="flex items-center justify-center gap-2 py-3.5 px-6 bg-[#800E13] hover:bg-[#9B2226] text-white font-medium text-sm rounded-2xl transition-all shadow-md shadow-[#800E13]/20 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>AI Đề Xuất Phối Đồ</span>
          </button>
        </div>

        {/* Suggestion Chips - Only select, user must click button to generate */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-[#7B6858]">Chọn nhanh dịp (bấm chọn rồi ấn nút Đề xuất):</span>
          {EVENT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setEventInput(chip);
                // Do not auto-generate: user must click button to generate
              }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                eventInput === chip
                  ? 'bg-[#800E13] text-white font-semibold shadow-xs'
                  : 'bg-[#F4EDE2] hover:bg-[#EAE0D1] text-[#4A3E35]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Mix Cards Output */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heritage text-xl font-bold text-[#2C241D]">
            Các Phương Án Đề Xuất Cho Bạn
          </h3>
          {mixOptions.length > 0 && (
            <span className="text-xs text-[#786454]">
              {mixOptions.length} phương án tối ưu
            </span>
          )}
        </div>

        {mixOptions.length === 0 ? (
          <div className="p-8 sm:p-12 bg-white rounded-3xl border border-dashed border-[#DFD1BD] text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-[#800E13]/10 text-[#800E13] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-heritage text-lg font-bold text-[#2C241D]">
                Chưa có đề xuất nào
              </h4>
              <p className="text-xs text-[#6C584C] leading-relaxed">
                Bạn đã chọn dịp: <strong className="text-[#800E13]">"{eventInput}"</strong>. Vui lòng bấm nút <strong>"AI Đề Xuất Phối Đồ"</strong> để AI bắt đầu phân tích điển chế và tìm trang phục tôn dáng nhất.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !eventInput.trim()}
              className="inline-flex items-center gap-2 py-3 px-6 bg-[#800E13] hover:bg-[#9B2226] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#800E13]/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Bấm Để AI Bắt Đầu Đề Xuất</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mixOptions.map((opt) => (
            <div
              key={opt.id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E9DFD1] shadow-xs hover:shadow-xl hover:border-[#D4A373] transition-all duration-300"
            >
              {/* Photo Box */}
              <div className="relative h-64 bg-[#EFE8DC] overflow-hidden">
                <CostumeImage
                  src={
                    cardPhotoModes[opt.id] === 'top'
                      ? (opt.costume.topImage || opt.costume.maleTopImage || opt.costume.femaleTopImage || opt.frontImage)
                      : opt.frontImage
                  }
                  alt={opt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none" />

                {/* Harmony & Gender badges */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E9C46A] text-[#2C241D] shadow-xs">
                    Điểm hài hòa: {opt.harmonyScore}/100
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                    {opt.costume.gender === 'female' ? 'Nữ ♀' : opt.costume.gender === 'male' ? 'Nam ♂' : 'Nam & Nữ ⚥'}
                  </span>
                </div>

                {/* 2D Mannequin button on image */}
                <button
                  onClick={() => handleViewOn2DStage(opt)}
                  title="Xem trên người mẫu 2D"
                  className="absolute top-3.5 right-3.5 p-2 bg-white/80 hover:bg-white text-stone-800 rounded-xl backdrop-blur-xs shadow-md transition-transform hover:scale-110 z-10"
                >
                  <User className="w-4 h-4 text-[#9B2226]" />
                </button>

                {/* Tops switcher button on card */}
                {(opt.costume.topImage || opt.costume.maleTopImage || opt.costume.femaleTopImage) && (
                  <button
                    onClick={() =>
                      setCardPhotoModes((prev) => ({
                        ...prev,
                        [opt.id]: prev[opt.id] === 'top' ? 'front' : 'top'
                      }))
                    }
                    className="absolute top-12 left-3.5 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold rounded-lg backdrop-blur-md border border-white/20 z-10 transition-colors"
                  >
                    {cardPhotoModes[opt.id] === 'top' ? 'Xem Toàn Cảnh' : 'Xem Ảnh Áo Thượng Phục'}
                  </button>
                )}

                <div className="absolute bottom-3 left-4 right-4 text-white z-10">
                  <span className="text-[10px] uppercase tracking-wider text-[#E9C46A] font-semibold block">
                    {opt.costume.dynasty}
                  </span>
                  <h4 className="font-heritage text-lg font-bold">
                    {opt.name}
                  </h4>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Tailored Reason based on height/weight/age */}
                <div className="p-3 bg-[#FAF5EE] rounded-xl border border-[#EFE5D6] text-xs text-[#5C4D3C] leading-relaxed">
                  <span className="font-bold text-[#800E13] block mb-0.5">
                    Lý do phối đồ:
                  </span>
                  {opt.recommendationReason}
                </div>

                {/* Included pieces */}
                <div className="space-y-1.5 text-xs text-[#4A3E35]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9B2226]" />
                    <span className="font-semibold">Cổ phục:</span> {opt.costume.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span className="font-semibold">Remix hiện đại:</span> {opt.modernGarment.name}
                  </div>
                  {opt.accessories[0] && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#BC6C25]" />
                      <span className="font-semibold">Phụ kiện:</span> {opt.accessories.map((a) => a.name).join(', ')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#F0E6D8] flex flex-col gap-2">
                  <div className="flex gap-2">
                    {/* "Tìm hiểu thêm" -> opens CostumeDetailModal */}
                    <button
                      onClick={() => setSelectedCostumeForDetail(opt.costume)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-[#4A3E35] rounded-xl text-xs font-medium transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Tìm hiểu thêm</span>
                    </button>

                    {/* "Xem trên người mẫu 2D" -> opens 2D Dress-up Stage */}
                    <button
                      onClick={() => handleViewOn2DStage(opt)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-[#F4EDE2] hover:bg-[#EAE0D1] text-[#800E13] rounded-xl text-xs font-semibold transition-colors"
                      title="Mở bộ đồ trên ma-nơ-canh 2D"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Mẫu 2D</span>
                    </button>
                  </div>

                  {/* "Thử lên người" (Camera Flow) */}
                  <button
                    onClick={() => setCameraTargetOutfit(opt)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#800E13] hover:bg-[#9B2226] text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-[#800E13]/20 hover:scale-101"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Thử lên người (Camera)</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Costume Detail Modal */}
      {selectedCostumeForDetail && (
        <CostumeDetailModal
          costume={selectedCostumeForDetail}
          onClose={() => setSelectedCostumeForDetail(null)}
        />
      )}

      {/* Camera Flow Modal */}
      {cameraTargetOutfit && (
        <CameraFlowModal
          onComplete={handleCameraComplete}
          onClose={() => setCameraTargetOutfit(null)}
        />
      )}

      {/* Virtual Fitting Result Modal */}
      {fittingResult && (
        <VirtualFittingResultModal
          outfit={fittingResult.outfit}
          userPhotoUrl={fittingResult.userPhoto}
          onClose={() => setFittingResult(null)}
        />
      )}
    </div>
  );
};
