import React from 'react';
import { DongSonDrumDetailed } from './DongSonDrumDetailed';
import { VietnamMapBackground } from './VietnamMapBackground';

/**
 * Nền cho giao diện Cài đặt kết hợp Trống đồng Đông Sơn và Bản đồ Việt Nam có Hoàng Sa & Trường Sa
 */
export const SettingsHeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Trống đồng Đông Sơn ở góc trên bên phải */}
      <DongSonDrumDetailed
        className="absolute -top-24 -right-24 sm:-top-20 sm:-right-20 lg:-top-16 lg:-right-16 w-[380px] sm:w-[500px] lg:w-[620px] h-[380px] sm:h-[500px] lg:h-[620px]"
        opacity={0.06}
      />

      {/* Bản đồ Việt Nam ở góc dưới bên trái */}
      <div className="absolute -bottom-16 -left-6 sm:bottom-0 sm:left-4 lg:bottom-4 lg:left-8 w-[260px] sm:w-[340px] lg:w-[420px] h-[340px] sm:h-[460px] lg:h-[560px]">
        <VietnamMapBackground
          className="w-full h-full"
          opacity={0.07}
        />
      </div>
    </div>
  );
};
