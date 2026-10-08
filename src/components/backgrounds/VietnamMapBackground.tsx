import React from 'react';

interface VietnamMapBackgroundProps {
  className?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

/**
 * Nền Bản đồ Việt Nam chuẩn vector từ file SVG
 * - Giữ trọn vẹn chủ quyền biển đảo với 2 quần đảo Hoàng Sa & Trường Sa cùng nhãn tên trang trọng
 * - Đã loại bỏ dòng thông tin nguồn ở đáy theo yêu cầu
 */
export const VietnamMapBackground: React.FC<VietnamMapBackgroundProps> = ({
  className = '',
  opacity = 0.08,
  style = {}
}) => {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity, ...style }}
    >
      <img
        src="/assets/vietnam_map_no_text.svg"
        alt="Bản đồ Việt Nam Di sản có Hoàng Sa & Trường Sa"
        className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
        loading="eager"
      />
    </div>
  );
};
