import React from 'react';

export interface NepLavisLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  theme?: 'dark' | 'light' | 'primary';
  className?: string;
  onClick?: () => void;
}

/**
 * Logo "Nếp" - Phong cách Thư pháp & Nghệ thuật Cổ điển Lavis (Lavis Calligraphic Script)
 * - Sử dụng font Lavis ('Lavishly Yours' / 'Alex Brush') bay bổng, thanh tao
 * - Nét chữ uyển chuyển, bay bổng, tôn vinh hồn cốt cổ phục Việt
 * - Màu đỏ son chu sa hoàng tộc (#9B2226)
 * - Text shadow tinh xảo, chiều sâu sơn mài truyền thống
 * - Giữ nguyên toàn bộ props interface tương thích 100% với Navbar, Footer, Lookbook
 */
export const NepLavisLogo: React.FC<NepLavisLogoProps> = ({
  size = 'md',
  theme = 'primary',
  showSubtext = false,
  className = '',
  onClick,
}) => {
  // Scaling configuration cho font chữ thư pháp Lavis
  const sizeConfig = {
    xs: {
      text: 'text-2xl sm:text-3xl',
      subtext: 'text-[8px] tracking-[0.2em]',
      dot: 'w-1 h-1',
      gap: 'gap-1',
    },
    sm: {
      text: 'text-3xl sm:text-4xl',
      subtext: 'text-[9px] tracking-[0.22em]',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1.5',
    },
    md: {
      text: 'text-4xl sm:text-5xl',
      subtext: 'text-[10px] tracking-[0.25em]',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1.5',
    },
    lg: {
      text: 'text-5xl sm:text-6xl',
      subtext: 'text-xs tracking-[0.28em]',
      dot: 'w-2 h-2',
      gap: 'gap-2',
    },
    xl: {
      text: 'text-6xl sm:text-7xl',
      subtext: 'text-sm tracking-[0.3em]',
      dot: 'w-2.5 h-2.5',
      gap: 'gap-2.5',
    },
  }[size];

  // Màu sắc son chu sa theo theme
  const colorStyles = {
    primary: {
      color: '#9B2226',
      textShadow: '0 2px 6px rgba(155, 34, 38, 0.32), 0 1px 2px rgba(0, 0, 0, 0.12)',
      dotBg: 'bg-[#9B2226]',
      subtextColor: 'text-[#9B2226]/85',
    },
    dark: {
      color: '#FF5A67',
      textShadow: '0 2px 8px rgba(255, 90, 103, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
      dotBg: 'bg-[#FF5A67]',
      subtextColor: 'text-[#FF8A95]',
    },
    light: {
      color: '#800E13',
      textShadow: '0 2px 5px rgba(128, 14, 19, 0.28), 0 1px 1px rgba(0, 0, 0, 0.1)',
      dotBg: 'bg-[#800E13]',
      subtextColor: 'text-[#800E13]/85',
    },
  }[theme];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col justify-center select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      title="Nếp - Di Sản Việt Phục Remix"
    >
      <div className={`flex items-baseline ${sizeConfig.gap}`}>
        {/* Chữ "Nếp" thể hiện theo font chữ thư pháp Lavis uyển chuyển */}
        <span
          className={`font-lavis leading-none transition-transform duration-300 group-hover:scale-[1.03] ${sizeConfig.text}`}
          style={{
            color: colorStyles.color,
            textShadow: colorStyles.textShadow,
            letterSpacing: '0.02em',
            paddingRight: '0.05em',
          }}
        >
          Nếp
        </span>

        {/* Dấu chấm son chu sa cổ phong tạo điểm nhấn */}
        <span
          className={`inline-block rounded-full ${colorStyles.dotBg} shadow-xs shrink-0 self-center opacity-90 transition-transform duration-300 group-hover:scale-125 ${sizeConfig.dot}`}
          style={{
            boxShadow: '0 1px 3px rgba(155, 34, 38, 0.4)',
          }}
        />
      </div>

      {/* Dòng chữ phụ đề phong cách di sản nếu showSubtext = true */}
      {showSubtext && (
        <span
          className={`font-viet-vintage uppercase font-semibold leading-tight -mt-1 ${colorStyles.subtextColor} ${sizeConfig.subtext}`}
        >
          Việt Phục Remix
        </span>
      )}
    </div>
  );
};
