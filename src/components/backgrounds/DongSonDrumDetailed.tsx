import React from 'react';

interface DongSonDrumProps {
  className?: string;
  opacity?: number;
  rotate?: boolean;
  style?: React.CSSProperties;
}

/**
 * Trống đồng Đông Sơn chi tiết chuẩn mực từ file SVG người dùng cung cấp
 * Họa tiết mặt trời 14 tia, bầy chim Lạc, người giã gạo, múa lễ hội, hươu sao.
 */
export const DongSonDrumDetailed: React.FC<DongSonDrumProps> = ({
  className = '',
  opacity = 0.07,
  rotate = false,
  style = {}
}) => {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity, ...style }}
    >
      <img
        src="/assets/trong_dong_dong_son.svg"
        alt="Trống đồng Đông Sơn"
        className={`w-full h-full object-contain pointer-events-none select-none ${
          rotate ? 'animate-[spin_360s_linear_infinite]' : ''
        }`}
        loading="eager"
      />
    </div>
  );
};
