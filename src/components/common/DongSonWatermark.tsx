import React from 'react';

interface DongSonPatternProps {
  className?: string;
  opacity?: number;
}

export const DongSonWatermark: React.FC<DongSonPatternProps> = ({ 
  className = 'w-96 h-96 pointer-events-none absolute',
  opacity = 0.05 
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Vòng tròn đồng tâm mặt trống đồng */}
        <circle cx="250" cy="250" r="230" strokeWidth="2" />
        <circle cx="250" cy="250" r="215" strokeDasharray="3 3" />
        <circle cx="250" cy="250" r="195" />
        <circle cx="250" cy="250" r="170" strokeDasharray="5 5" />
        <circle cx="250" cy="250" r="140" />
        <circle cx="250" cy="250" r="100" />
        <circle cx="250" cy="250" r="50" />

        {/* Ngôi sao Thái Dương 14 cánh ở trung tâm */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14;
          return (
            <polygon
              key={`star-ray-${i}`}
              points="250,200 244,242 250,250 256,242"
              transform={`rotate(${angle} 250 250)`}
              fill="currentColor"
            />
          );
        })}

        {/* Đàn chim Lạc bay ngược chiều kim đồng hồ */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g
              key={`lac-bird-${i}`}
              transform={`rotate(${angle} 250 250) translate(250, 95) scale(0.7)`}
            >
              {/* Thân và mỏ dài đặc trưng của chim Lạc */}
              <path
                d="M -35 0 C -15 -10, 10 -8, 30 5 C 10 2, -10 15, -25 10 Z"
                fill="currentColor"
              />
              {/* Đôi cánh vút bay */}
              <path
                d="M -10 -5 C 5 -30, 20 -40, 35 -35 C 15 -25, 5 -15, -5 -2 Z"
                fill="currentColor"
              />
            </g>
          );
        })}

        {/* Họa tiết răng cưa và vòng tròn tiếp tuyến */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <circle
              key={`dot-${i}`}
              cx="250"
              cy="70"
              r="2.5"
              transform={`rotate(${angle} 250 250)`}
              fill="currentColor"
            />
          );
        })}
      </g>
    </svg>
  );
};
