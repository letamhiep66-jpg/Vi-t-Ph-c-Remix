import React from 'react';
import { DongSonDrumDetailed } from './DongSonDrumDetailed';
import { VietnamMapBackground } from './VietnamMapBackground';

/**
 * Nền Di sản kết hợp 2 biểu tượng SVG:
 * 1. Trống đồng Đông Sơn (hoa văn tinh xảo nguyên bản từ SVG)
 * 2. Bản đồ Việt Nam (đầy đủ Hoàng Sa, Trường Sa và nhãn tên quần đảo, đã loại bỏ dòng ghi chú nguồn ở đáy)
 */
export const ExploreHeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Trống đồng Đông Sơn đặt ở góc trên bên phải làm hoa văn cổ điển */}
      <DongSonDrumDetailed
        className="absolute -top-24 -right-24 sm:-top-20 sm:-right-20 lg:-top-16 lg:-right-16 w-[440px] sm:w-[580px] lg:w-[720px] h-[440px] sm:h-[580px] lg:h-[720px]"
        opacity={0.065}
      />

      {/* 2. Bản đồ Việt Nam toàn vẹn lãnh thổ có hai quần đảo Hoàng Sa & Trường Sa */}
      <div className="absolute left-1 sm:left-6 lg:left-10 top-20 sm:top-24 w-[280px] sm:w-[380px] lg:w-[460px] h-[360px] sm:h-[490px] lg:h-[590px]">
        <VietnamMapBackground
          className="w-full h-full"
          opacity={0.075}
        />
      </div>
    </div>
  );
};
