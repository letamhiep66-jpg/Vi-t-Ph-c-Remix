import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { MixOption, CanvasLayerState, UserProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { VietnamMapWithIslands } from '../common/VietnamMapWithIslands';
import { DongSonWatermark } from '../common/DongSonWatermark';
import { NepLavisLogo } from '../common/NepLavisLogo';
import { CostumeImage } from '../common/CostumeImage';
import { X, Download, Share2, Check, Sparkles, History, Loader2 } from 'lucide-react';

interface LookbookExportModalProps {
  outfit: MixOption | CanvasLayerState;
  userPhotoUrl: string;
  userProfile: UserProfile;
  onClose: () => void;
}

export const LookbookExportModal: React.FC<LookbookExportModalProps> = ({
  outfit,
  userPhotoUrl,
  userProfile,
  onClose
}) => {
  const { saveLookbook, setActiveTab, effectiveStylingProfile } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [savedToHistory, setSavedToHistory] = useState<boolean>(false);
  const lookbookCardRef = useRef<HTMLDivElement>(null);

  // Extract info whether it's MixOption or CanvasLayerState
  const isMixOption = 'costume' in outfit;
  const costume = isMixOption ? outfit.costume : outfit.traditional;
  const modernName = isMixOption 
    ? outfit.modernGarment.name 
    : (outfit.modern ? outfit.modern.name : 'Quần lụa truyền thống');
  const accessoryName = isMixOption
    ? (outfit.accessories[0]?.name || 'Khăn đóng ngũ thân')
    : (outfit.accessory ? outfit.accessory.name : 'Không kèm phụ kiện');

  const traditionalColorName = isMixOption
    ? outfit.colorPalette[0]?.name || 'Đỏ Điều'
    : outfit.traditionalColor.name;

  const modernColorName = isMixOption
    ? outfit.colorPalette[1]?.name || 'Kem Sữa'
    : outfit.modernColor.name;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    setIsExporting(true);

    try {
      let exportUrl = userPhotoUrl || costume.frontImage;

      // Capture actual Lookbook DOM using html2canvas
      if (lookbookCardRef.current) {
        try {
          const canvas = await html2canvas(lookbookCardRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFDF9'
          });
          exportUrl = canvas.toDataURL('image/png');
        } catch (canvasErr) {
          console.warn('html2canvas capture error, falling back to direct photo:', canvasErr);
        }
      }

      if (!savedToHistory) {
        saveLookbook({
          title: `Lookbook ${costume.name} × ${modernName}`,
          compositeImage: exportUrl,
          costumeName: costume.name,
          costumeEra: costume.era,
          costumeId: costume.id,
          modernGarmentName: modernName,
          modernGarmentCategory: isMixOption ? outfit.modernGarment.category : (outfit.modern ? (outfit.modern as any).category || 'pants' : 'pants'),
          modernGarmentId: isMixOption ? outfit.modernGarment.id : (outfit.modern ? outfit.modern.id : undefined),
          accessoryNames: isMixOption ? outfit.accessories.map((a) => a.name) : (outfit.accessory ? [outfit.accessory.name] : []),
          traditionalColorName,
          modernColorName,
          occasion: isMixOption ? outfit.event : 'Phối đồ tự do trên Canvas',
          harmonyScore: isMixOption ? outfit.harmonyScore : 95,
          notes: `Lookbook phong cách di sản tạo bởi ${userProfile?.name || 'Khách Quý Nếp'}`,
          canvasState: !isMixOption ? (outfit as CanvasLayerState) : undefined
        });
        setSavedToHistory(true);
      }

      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `Lookbook-VietPhuc-Nep.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-2xl bg-[#FBF8F3] rounded-3xl shadow-2xl overflow-hidden border-2 border-[#D4A373]/60 my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DFD1] bg-[#F4EDE2]/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9B2226]" />
            <h3 className="font-heritage text-lg font-bold text-[#2C241D]">
              Phiếu Phối Đồ · Lookbook Việt Phục Remix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Lookbook Card Body */}
        <div ref={lookbookCardRef} className="relative p-6 sm:p-8 bg-[#FFFDF9] overflow-hidden">
          {/* Subtle Dong Son motif background */}
          <DongSonWatermark className="top-10 -right-20 w-80 h-80 text-[#9B2226]" opacity={0.04} />

          {/* Border decorative frame */}
          <div className="relative border border-[#DFD1BD] rounded-2xl p-6 bg-radial from-white via-[#FCFAF6] to-[#F8F4EC] shadow-inner">
            {/* Top Seal & Sovereign Emblem with Lavis Logo */}
            <div className="flex items-start justify-between border-b border-[#EAE0D3] pb-4">
              <div>
                <NepLavisLogo size="sm" showSubtext={true} />
                <p className="text-[10px] text-[#786454] uppercase tracking-widest mt-1">
                  Hồ Sơ Phong Cách Việt Phục Nếp
                </p>
              </div>

              {/* Red Official Seal Stamp (Triện son) */}
              <div className="border-2 border-[#800E13] text-[#800E13] px-2.5 py-1 rounded text-center rotate-3 font-heritage text-[11px] font-bold shadow-xs">
                <div>CHUẨN MỰC</div>
                <div className="text-[9px] border-t border-[#800E13]/40 mt-0.5 pt-0.5">Y PHỤC VIỆT</div>
              </div>
            </div>

            {/* Lookbook Layout: User Composite + Specifications */}
            <div className="grid sm:grid-cols-2 gap-6 mt-6 items-center">
              {/* Composite Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#E9DFD1] bg-[#EFE8DC] aspect-3/4">
                <CostumeImage
                  src={userPhotoUrl || costume.frontImage}
                  alt="Ảnh phối đồ"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E9C46A] block">
                    Người mặc: {effectiveStylingProfile.name}
                  </span>
                  <span className="font-heritage text-base font-bold">
                    {costume.name}
                  </span>
                </div>
              </div>

              {/* Specs & Culture Breakdown */}
              <div className="space-y-3.5 text-xs text-[#3E342B]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                    Hồ sơ nhân trắc
                  </span>
                  <p className="font-medium text-[#2C241D]">
                    {effectiveStylingProfile.age} tuổi · Cao {effectiveStylingProfile.height}cm · Nặng {effectiveStylingProfile.weight}kg ({effectiveStylingProfile.gender === 'female' ? 'Nữ' : 'Nam'})
                  </p>
                </div>

                <div className="border-t border-[#EAE0D3] pt-2">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                    Cổ phục nền tảng
                  </span>
                  <p className="font-semibold text-[#800E13] text-sm font-heritage">
                    {costume.name} ({costume.dynasty})
                  </p>
                </div>

                <div className="border-t border-[#EAE0D3] pt-2">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                    Remix hiện đại & Phụ kiện
                  </span>
                  <p className="font-medium">
                    {modernName} · {accessoryName}
                  </p>
                </div>

                <div className="border-t border-[#EAE0D3] pt-2">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                    Sắc màu ứng đối
                  </span>
                  <p className="font-medium">
                    {traditionalColorName} × {modernColorName}
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

            {/* MANDATORY VIETNAM SOVEREIGNTY MAP FOOTER ON LOOKBOOK */}
            <div className="mt-6 pt-4 border-t border-[#EAE0D3] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8F3EC]/70 p-3.5 rounded-xl">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-bold text-[#800E13] uppercase tracking-wider block">
                  Bản Đồ Non Sông Gấm Vóc
                </span>
                <p className="text-[10px] text-[#6C584C]">
                  Toàn vẹn bờ cõi cùng hai quần đảo Hoàng Sa và Trường Sa
                </p>
              </div>

              {/* Compact Vietnam Map with both Paracel & Spratly Islands clearly demarcated */}
              <div className="shrink-0">
                <VietnamMapWithIslands className="w-28 h-36" showLabels={true} isCompact={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#F4EDE2] border-t border-[#E9DFD1]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#786454]">
              {savedToHistory ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đã tự động lưu vào Lịch Sử Lookbook!
                </span>
              ) : downloadSuccess ? (
                '✓ Đã tạo phiếu thành công!'
              ) : copied ? (
                '✓ Đã sao chép liên kết!'
              ) : (
                'Tải về & tự động lưu vào Lịch Sử'
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {savedToHistory && (
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('history');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF5EE] hover:bg-[#EFE5D5] text-[#800E13] border border-[#DFCFC0] rounded-xl text-xs font-semibold transition-colors"
              >
                <History className="w-3.5 h-3.5 text-[#9B2226]" />
                <span>Xem trong Lịch Sử</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-100 text-[#3E342B] border border-[#D8C7B3] rounded-xl text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] disabled:opacity-75 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-[#800E13]/20"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExporting ? 'Đang trích xuất ảnh...' : downloadSuccess ? 'Đã tải thành công!' : 'Tải Lookbook (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
