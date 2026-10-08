import React from 'react';
import { VietnamMapBackground } from './VietnamMapBackground';
import { DongSonDrumDetailed } from './DongSonDrumDetailed';

/**
 * Nền cho giao diện Phối đồ (Mix) kết hợp cả 2 file SVG:
 * 1. Bản đồ Việt Nam (đầy đủ hai quần đảo Hoàng Sa - Trường Sa cùng nhãn tên)
 * 2. Trống đồng Đông Sơn (hoa văn tinh xảo nguyên bản từ SVG)
 */
export const MixHeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Trống đồng Đông Sơn đặt ở góc trên bên trái */}
      <DongSonDrumDetailed
        className="absolute -top-28 -left-28 sm:-top-20 sm:-left-20 lg:-top-16 lg:-left-16 w-[400px] sm:w-[540px] lg:w-[660px] h-[400px] sm:h-[540px] lg:h-[660px]"
        opacity={0.06}
      />

      {/* Bản đồ Việt Nam có Hoàng Sa & Trường Sa đặt ở sườn phải */}
      <div className="absolute right-1 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] lg:w-[460px] h-[360px] sm:h-[490px] lg:h-[590px]">
        <VietnamMapBackground
          className="w-full h-full"
          opacity={0.075}
        />
      </div>
    </div>
  );
};
