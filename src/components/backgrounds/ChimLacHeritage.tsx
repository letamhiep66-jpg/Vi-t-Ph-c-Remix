import React from 'react';

interface ChimLacProps {
  className?: string;
  variant?: 'top-flying' | 'middle-curved' | 'bottom-pair' | 'all';
  color?: string;
  opacity?: number;
}

/**
 * Họa tiết Chim Lạc Đông Sơn chính xác theo bản rập khảo cổ (Image 1)
 * Gồm 3 kiểu dáng đặc trưng:
 * 1. Chim mỏ tên cánh nan lược bay ngang (con trên)
 * 2. Chim cổ dài có 4 vòng tròn đồng tâm, cánh lược đôi (con giữa)
 * 3. Đôi chim chụm đầu hoa văn chấm tròn li ti (cặp dưới)
 */
export const ChimLacHeritage: React.FC<ChimLacProps> = ({
  className = '',
  variant = 'all',
  color = '#2C241D',
  opacity = 0.12
}) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <svg
        viewBox="0 0 400 700"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* ================= CON 1 (TRÊN CÙNG): Chim mỏ tên bay ngang ================= */}
        {(variant === 'all' || variant === 'top-flying') && (
          <g id="chim-lac-top" transform="translate(40, 30)">
            {/* Mỏ dài nhọn hoắt như mũi tên */}
            <path d="M 180 50 L 320 25" strokeWidth="3" />
            <path d="M 180 50 L 300 28" strokeWidth="1.8" />

            {/* Đầu và mắt chim */}
            <path d="M 155 58 C 165 48, 175 48, 185 52" strokeWidth="2.5" />
            <circle cx="170" cy="53" r="5" strokeWidth="2" />
            <circle cx="170" cy="53" r="2" fill={color} />

            {/* Mào 3 nhánh vươn ngược về sau đầu */}
            <line x1="160" y1="48" x2="155" y2="32" strokeWidth="2.5" />
            <line x1="168" y1="46" x2="165" y2="30" strokeWidth="2.5" />
            <line x1="176" y1="48" x2="178" y2="34" strokeWidth="2.5" />

            {/* Cổ dài lượn sóng */}
            <path d="M 120 75 C 135 70, 145 65, 160 55" strokeWidth="3" />
            <path d="M 115 88 C 135 85, 150 75, 165 60" strokeWidth="2" />

            {/* Thân chữ nhật có các vạch song song */}
            <rect x="95" y="45" width="28" height="50" rx="2" strokeWidth="2.5" />
            <line x1="95" y1="55" x2="123" y2="55" strokeWidth="1.5" />
            <line x1="95" y1="65" x2="123" y2="65" strokeWidth="1.5" />
            <line x1="95" y1="75" x2="123" y2="75" strokeWidth="1.5" />
            <line x1="95" y1="85" x2="123" y2="85" strokeWidth="1.5" />

            {/* Cánh dài dang rộng có các vạch lược song song */}
            <path d="M 95 50 L -15 65 L -10 95 L 95 85 Z" strokeWidth="2.5" />
            {[...Array(10)].map((_, i) => (
              <line key={i} x1={-5 + i * 10} y1="68" x2={-5 + i * 10} y2="92" strokeWidth="1.5" />
            ))}

            {/* Đuôi chim xòe nan */}
            <path d="M -15 65 L -35 60 L -30 95 L -10 95 Z" strokeWidth="2" />

            {/* Chân chim duỗi thẳng ra sau với các móng vuốt */}
            <path d="M 50 95 L 80 115 L 70 125" strokeWidth="2" />
            <line x1="80" y1="115" x2="95" y2="120" strokeWidth="2" />
            <line x1="80" y1="115" x2="90" y2="128" strokeWidth="2" />
          </g>
        )}

        {/* ================= CON 2 (Ở GIỮA): Chim cổ dài 4 vòng tròn ================= */}
        {(variant === 'all' || variant === 'middle-curved') && (
          <g id="chim-lac-middle" transform="translate(40, 220)">
            {/* Mỏ dài nhọn hoắt */}
            <path d="M 210 75 L 340 60" strokeWidth="3" />
            <path d="M 210 75 L 320 63" strokeWidth="1.8" />

            {/* Đầu và mắt chim */}
            <path d="M 195 80 C 205 70, 215 70, 220 75" strokeWidth="2" />
            <circle cx="205" cy="74" r="5" strokeWidth="2" />
            <circle cx="205" cy="74" r="2" fill={color} />

            {/* Cổ lượn hình chữ S mang chuỗi 4 vòng tròn đồng tâm đặc trưng */}
            <path d="M 110 115 C 135 110, 165 95, 195 78" strokeWidth="3.5" />
            <circle cx="140" cy="104" r="5.5" strokeWidth="2" />
            <circle cx="140" cy="104" r="2" fill={color} />
            <circle cx="155" cy="94" r="5.5" strokeWidth="2" />
            <circle cx="155" cy="94" r="2" fill={color} />
            <circle cx="170" cy="85" r="5.5" strokeWidth="2" />
            <circle cx="170" cy="85" r="2" fill={color} />
            <circle cx="185" cy="78" r="5.5" strokeWidth="2" />
            <circle cx="185" cy="78" r="2" fill={color} />

            {/* Cánh trên dựng đứng và cánh dưới xòe dọc (Image 1) */}
            <rect x="90" y="30" width="36" height="55" rx="3" strokeWidth="2.5" />
            {[...Array(7)].map((_, i) => (
              <line key={i} x1="90" y1={38 + i * 6.5} x2="126" y2={38 + i * 6.5} strokeWidth="1.8" />
            ))}

            <rect x="90" y="105" width="36" height="55" rx="3" strokeWidth="2.5" />
            {[...Array(7)].map((_, i) => (
              <line key={i} x1="90" y1={113 + i * 6.5} x2="126" y2={113 + i * 6.5} strokeWidth="1.8" />
            ))}

            {/* Thân thon và đuôi quạt dài */}
            <path d="M 90 100 L -20 105 L -20 85 L 90 85 Z" strokeWidth="2.5" />
            {[...Array(7)].map((_, i) => (
              <line key={i} x1={-15 + i * 15} y1="88" x2={-15 + i * 15} y2="102" strokeWidth="1.5" />
            ))}

            {/* Các tia lông đuôi / chân buông dài */}
            <line x1="20" y1="120" x2="-10" y2="120" strokeWidth="2" />
            <line x1="30" y1="128" x2="-5" y2="128" strokeWidth="2" />
            <line x1="40" y1="136" x2="0" y2="136" strokeWidth="2" />
          </g>
        )}

        {/* ================= CON 3 (DƯỚI CÙNG): Đôi chim chụm đầu ================= */}
        {(variant === 'all' || variant === 'bottom-pair') && (
          <g id="chim-lac-pair" transform="translate(90, 440)">
            {/* Chim bên trái */}
            <g transform="translate(0, 0)">
              {/* Mào cao dựng đứng */}
              <path d="M 80 40 L 75 0 L 85 0 L 88 40" strokeWidth="2.5" />
              <line x1="78" y1="10" x2="84" y2="10" strokeWidth="1.5" />
              <line x1="79" y1="20" x2="85" y2="20" strokeWidth="1.5" />

              {/* Đầu và mắt */}
              <circle cx="85" cy="55" r="6" strokeWidth="2" />
              <circle cx="85" cy="55" r="2.5" fill={color} />

              {/* Mỏ dài chúc xuống */}
              <path d="M 90 62 L 105 130 L 98 130 L 85 70" strokeWidth="2" />

              {/* Mình chim với hoa văn chấm tròn */}
              <path d="M 80 65 C 60 75, 45 100, 40 140 C 35 170, 25 210, 20 220 L 60 220 C 75 190, 85 160, 95 130 Z" strokeWidth="2.5" />
              {/* Chấm tròn hoa văn trên lưng và ngực */}
              <circle cx="65" cy="100" r="3" strokeWidth="1.5" />
              <circle cx="55" cy="120" r="3" strokeWidth="1.5" />
              <circle cx="70" cy="130" r="3" strokeWidth="1.5" />
              <circle cx="60" cy="150" r="3" strokeWidth="1.5" />
              <circle cx="50" cy="170" r="3" strokeWidth="1.5" />
              <circle cx="45" cy="190" r="3" strokeWidth="1.5" />

              {/* Lông đuôi vạch chéo */}
              <line x1="22" y1="210" x2="45" y2="185" strokeWidth="1.8" />
              <line x1="25" y1="215" x2="52" y2="190" strokeWidth="1.8" />

              {/* Chân gấp khúc */}
              <path d="M 55 200 L 90 190 L 50 215 L 105 215" strokeWidth="2.5" />
            </g>

            {/* Chim bên phải chụm đầu */}
            <g transform="translate(60, 25) scale(0.9)">
              <path d="M 75 40 L 70 5 L 80 5 L 82 40" strokeWidth="2.5" />
              <circle cx="80" cy="55" r="6" strokeWidth="2" />
              <circle cx="80" cy="55" r="2.5" fill={color} />
              <path d="M 85 62 L 95 125 L 88 125 L 80 70" strokeWidth="2" />
              <path d="M 75 65 C 55 75, 40 100, 35 140 C 30 170, 20 210, 15 220 L 55 220 C 70 190, 80 160, 90 130 Z" strokeWidth="2.5" />
              <circle cx="60" cy="100" r="3" strokeWidth="1.5" />
              <circle cx="50" cy="120" r="3" strokeWidth="1.5" />
              <circle cx="65" cy="130" r="3" strokeWidth="1.5" />
              <circle cx="55" cy="150" r="3" strokeWidth="1.5" />
              <circle cx="45" cy="170" r="3" strokeWidth="1.5" />
              <path d="M 50 200 L 85 190 L 45 215 L 100 215" strokeWidth="2.5" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
