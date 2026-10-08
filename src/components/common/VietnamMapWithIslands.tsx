import React from 'react';

interface VietnamMapProps {
  className?: string;
  showLabels?: boolean;
  accentColor?: string;
  isCompact?: boolean;
}

/**
 * Component Bản đồ Việt Nam với ĐẦY ĐỦ các đảo và hai quần đảo HOÀNG SA, TRƯỜNG SA
 * Tuân thủ tuyệt đối quy định chủ quyền lãnh thổ Việt Nam
 */
export const VietnamMapWithIslands: React.FC<VietnamMapProps> = ({
  className = 'w-48 h-64',
  showLabels = true,
  accentColor = '#9B2226',
  isCompact = false
}) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 400"
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vnMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#671114" stopOpacity="0.95" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Biển Đông Water Body Grid Lines */}
        <path
          d="M20 200 Q 160 190 300 210 M30 240 Q 170 230 290 250 M40 280 Q 180 270 300 290"
          stroke="#e2d9cc"
          strokeWidth="0.75"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.6"
        />

        {/* Đất liền Việt Nam hình chữ S duyên dáng */}
        <path
          d="M 120 40 
             C 145 35, 175 42, 185 60 
             C 192 75, 175 88, 160 95
             C 145 102, 135 110, 138 122
             C 140 135, 155 145, 168 155
             C 185 168, 195 185, 202 205
             C 210 225, 205 245, 195 260
             C 185 275, 165 290, 155 305
             C 145 320, 120 335, 105 340
             C 95 343, 85 330, 92 315
             C 98 300, 120 285, 135 270
             C 148 255, 150 238, 142 220
             C 135 205, 125 190, 115 175
             C 105 160, 98 140, 100 120
             C 102 95, 108 60, 120 40 Z"
          fill="url(#vnMapGrad)"
          stroke="#800E13"
          strokeWidth="1.5"
        />

        {/* Đảo Bạch Long Vĩ */}
        <circle cx="178" cy="85" r="3" fill={accentColor} stroke="#fff" strokeWidth="0.8" />
        {showLabels && !isCompact && (
          <text x="185" y="87" fontSize="7" fill="#5c4436" fontWeight="600">
            Bạch Long Vĩ
          </text>
        )}

        {/* QUẦN ĐẢO HOÀNG SA (VIỆT NAM) */}
        <g id="quan-dao-hoang-sa" className="cursor-pointer group">
          <rect x="220" y="145" width="85" height="50" rx="4" fill="#9B2226" fillOpacity="0.08" stroke="#9B2226" strokeWidth="0.75" strokeDasharray="2 2" />
          {/* Cụm đảo Hoàng Sa: Đảo Hoàng Sa, Tri Tôn, Phú Lâm, Linh Côn */}
          <circle cx="240" cy="160" r="3.5" fill="#9B2226" stroke="#fff" strokeWidth="1" />
          <circle cx="252" cy="155" r="2.8" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="265" cy="165" r="3.2" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="248" cy="172" r="2.5" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="260" cy="178" r="2.5" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          
          <text x="225" y="190" fontSize="7.5" fill="#9B2226" fontWeight="bold">
            Q.Đ HOÀNG SA
          </text>
          <text x="225" y="198" fontSize="6.5" fill="#671114" fontWeight="600">
            (VIỆT NAM)
          </text>
        </g>

        {/* QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM) */}
        <g id="quan-dao-truong-sa" className="cursor-pointer group">
          <rect x="205" y="240" width="105" height="70" rx="4" fill="#9B2226" fillOpacity="0.08" stroke="#9B2226" strokeWidth="0.75" strokeDasharray="2 2" />
          {/* Cụm đảo Trường Sa: Đảo Trường Sa Lớn, Song Tử Tây, Nam Yết, Sinh Tồn, An Bang */}
          <circle cx="225" cy="255" r="3" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="245" cy="250" r="3.5" fill="#9B2226" stroke="#fff" strokeWidth="1" />
          <circle cx="260" cy="265" r="2.8" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="238" cy="275" r="3.8" fill="#9B2226" stroke="#fff" strokeWidth="1" />
          <circle cx="255" cy="285" r="3" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="275" cy="275" r="2.5" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />
          <circle cx="285" cy="295" r="2.8" fill="#9B2226" stroke="#fff" strokeWidth="0.8" />

          <text x="212" y="303" fontSize="7.5" fill="#9B2226" fontWeight="bold">
            Q.Đ TRƯỜNG SA
          </text>
          <text x="212" y="311" fontSize="6.5" fill="#671114" fontWeight="600">
            (VIỆT NAM)
          </text>
        </g>

        {/* ĐẢO PHÚ QUỐC */}
        <g id="dao-phu-quoc">
          <ellipse cx="78" cy="340" rx="4.5" ry="6" fill={accentColor} stroke="#fff" strokeWidth="1" />
          {showLabels && (
            <text x="50" y="352" fontSize="6.5" fill="#5c4436" fontWeight="600">
              Đảo Phú Quốc
            </text>
          )}
        </g>

        {/* CÔN ĐẢO */}
        <g id="con-dao">
          <circle cx="140" cy="360" r="3.5" fill={accentColor} stroke="#fff" strokeWidth="0.8" />
          {showLabels && (
            <text x="146" y="362" fontSize="6.5" fill="#5c4436" fontWeight="600">
              Côn Đảo
            </text>
          )}
        </g>

        {/* La bàn Đông Sơn thu nhỏ */}
        <g transform="translate(45, 60)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="#cbb9a1" strokeWidth="0.8" />
          <path d="M 0 -12 L 3 -2 L 0 0 L -3 -2 Z" fill="#9B2226" />
          <path d="M 0 12 L 2 2 L 0 0 L -2 2 Z" fill="#cbb9a1" />
          <text x="-3" y="-14" fontSize="6.5" fontWeight="bold" fill="#9B2226">B</text>
        </g>
      </svg>
    </div>
  );
};
