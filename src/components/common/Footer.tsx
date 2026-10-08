import React from 'react';
import { useApp } from '../../context/AppContext';
import { NepLavisLogo } from './NepLavisLogo';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="mt-16 bg-[#F4EDE2] border-t border-[#E5DACD] text-[#4A3E35] transition-colors relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Col 1: Brand & Concept with Lavis Logo */}
          <div className="space-y-3">
            <NepLavisLogo size="md" showSubtext={true} />
            <p className="text-xs text-[#6C584C] leading-relaxed">
              Dự án số hóa và dung hợp trang phục truyền thống Việt Nam cùng thời trang đương đại. Gìn giữ cốt cách, mở rộng biên độ sáng tạo.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-heritage font-bold text-xs uppercase tracking-wider text-[#2C241D]">
              Khám Phá Tính Năng
            </h4>
            <div className="flex flex-col space-y-1.5 text-xs text-[#5C4D3C]">
              <button
                onClick={() => setActiveTab('explore')}
                className="text-left hover:text-[#9B2226] transition-colors"
              >
                1. Khám phá kho tàng Việt Phục
              </button>
              <button
                onClick={() => setActiveTab('mix')}
                className="text-left hover:text-[#9B2226] transition-colors"
              >
                2. Phối đồ theo sự kiện & Phối tự do
              </button>
              <button
                onClick={() => setActiveTab('critique')}
                className="text-left hover:text-[#9B2226] transition-colors"
              >
                3. Chấm điểm & Thẩm định phối đồ Việt phục
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="text-left hover:text-[#9B2226] transition-colors"
              >
                4. Lịch sử Lookbook & Bộ sưu tập đã lưu
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-left hover:text-[#9B2226] transition-colors"
              >
                5. Tủ đồ cá nhân & Cài đặt nhân trắc học
              </button>
            </div>
          </div>

          {/* Col 3: Cultural Heritage Preservation */}
          <div className="p-4 bg-[#FAF5EE] rounded-2xl border border-[#DFD1BD] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#800E13] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bảo Tồn & Sáng Tạo Di Sản</span>
            </div>
            <p className="text-[11px] text-[#6C584C] leading-relaxed">
              Tôn vinh giá trị mỹ thuật cổ truyền qua các triều đại Lý, Trần, Lê, Nguyễn và các thời kỳ phát triển của áo dài truyền thống qua lăng kính thời trang đương đại.
            </p>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-6 border-t border-[#DFD1BD] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7B6858]">
          <p>© 2026 Nếp - Việt Phục Remix. Bảo lưu mọi quyền.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Dệt bằng tình yêu di sản văn hóa Đại Việt</span>
            <Heart className="w-3.5 h-3.5 text-[#9B2226] fill-[#9B2226]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
