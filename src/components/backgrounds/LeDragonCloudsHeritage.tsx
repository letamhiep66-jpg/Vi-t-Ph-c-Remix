import React from 'react';

interface LeDragonProps {
  className?: string;
  color?: string;
  opacity?: number;
}

/**
 * Họa tiết Rồng vờn mây thời Lê / Trần chạm khắc gỗ đình làng (Image 3)
 * Đặc trưng: Hai dải rồng uy nghi uốn lượn ẩn hiện giữa các đám mây đao lửa cuộn sóng,
 * vảy rồng rõ nét, mắt sáng, móng rồng sắc nhọn, đuôi xòe như ngọn lửa.
 */
export const LeDragonCloudsHeritage: React.FC<LeDragonProps> = ({
  className = '',
  color = '#2C241D',
  opacity = 0.12
}) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <svg
        viewBox="0 0 900 480"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Dải phân cách khung trên và dưới (Image 3) */}
        <line x1="20" y1="20" x2="880" y2="20" strokeWidth="2.5" />
        <line x1="20" y1="240" x2="880" y2="240" strokeWidth="2.5" />
        <line x1="20" y1="460" x2="880" y2="460" strokeWidth="2.5" />

        {/* ================= DẢI RỒNG TRÊN (IMAGE 3) ================= */}
        <g id="dragon-upper" transform="translate(40, 20)">
          {/* Đầu rồng ngẩng cao ngoảnh lại phía sau */}
          <path d="M 680 120 C 710 100, 740 90, 770 110 C 785 120, 780 150, 750 160 C 720 170, 700 150, 680 135" strokeWidth="3" />
          {/* Mắt rồng thao láo, răng nanh */}
          <circle cx="745" cy="125" r="7" strokeWidth="2" />
          <circle cx="745" cy="125" r="3" fill={color} />
          <path d="M 760 145 L 775 140 L 765 152" strokeWidth="2" />
          {/* Sừng rồng và bờm lửa vươn ngược lên */}
          <path d="M 720 105 C 725 75, 715 50, 735 35 C 745 50, 740 75, 745 95" strokeWidth="2.5" />
          <path d="M 750 95 C 770 70, 790 60, 810 75 C 795 90, 780 100, 765 110" strokeWidth="2.5" />

          {/* Thân rồng uốn lượn có vảy đan khít */}
          <path
            d="M 680 135 
               C 640 180, 580 200, 530 160 
               C 480 120, 440 60, 370 80 
               C 300 100, 260 190, 180 170 
               C 120 155, 90 90, 30 130"
            strokeWidth="3.5"
          />
          <path
            d="M 670 150 
               C 630 195, 575 212, 525 175 
               C 475 135, 435 80, 365 95 
               C 295 115, 255 205, 175 185 
               C 115 170, 85 105, 25 145"
            strokeWidth="2"
            strokeDasharray="5 3"
          />

          {/* Vây gai lưng hình ngọn lửa sắc bén (Image 3) */}
          {[...Array(18)].map((_, i) => (
            <path
              key={`fin-upper-${i}`}
              d={`M ${120 + i * 32} ${130 + Math.sin(i * 0.7) * 35} L ${128 + i * 32} ${108 + Math.sin(i * 0.7) * 35} L ${136 + i * 32} ${130 + Math.sin(i * 0.7) * 35}`}
              strokeWidth="2"
            />
          ))}

          {/* Móng rồng 4 ngón sắc nhọn chộp mây */}
          <path d="M 520 180 L 490 215 M 490 215 L 475 205 M 490 215 L 485 230 M 490 215 L 505 225" strokeWidth="2.5" />
          <path d="M 330 110 L 305 75 M 305 75 L 290 85 M 305 75 L 300 60 M 305 75 L 320 65" strokeWidth="2.5" />

          {/* Đuôi rồng xòe ngọn lửa uốn lượn thướt tha */}
          <path d="M 30 130 C -5 140, -15 110, 0 85 C 10 65, 30 80, 20 100 C 10 120, -5 105, -20 120" strokeWidth="2.5" />

          {/* Mây đao lửa cuộn bao quanh (Image 3) */}
          <path d="M 450 70 C 470 45, 510 50, 495 80 C 480 100, 440 90, 455 65" strokeWidth="2" />
          <path d="M 230 160 C 250 135, 290 140, 275 170 C 260 190, 220 180, 235 155" strokeWidth="2" />
          <path d="M 610 80 C 630 60, 660 65, 650 90 C 640 105, 610 100, 620 75" strokeWidth="2" />
        </g>

        {/* ================= DẢI RỒNG DƯỚI (IMAGE 3) ================= */}
        <g id="dragon-lower" transform="translate(40, 240)">
          <path
            d="M 680 135 
               C 640 180, 580 200, 530 160 
               C 480 120, 440 60, 370 80 
               C 300 100, 260 190, 180 170 
               C 120 155, 90 90, 30 130"
            strokeWidth="3.5"
          />
          <circle cx="745" cy="125" r="7" strokeWidth="2" />
          <circle cx="745" cy="125" r="3" fill={color} />
          <path d="M 720 105 C 725 75, 715 50, 735 35" strokeWidth="2.5" />
          <path d="M 750 95 C 770 70, 810 75" strokeWidth="2.5" />
          {/* Mây xoắn cuộn */}
          <path d="M 400 160 C 430 130, 480 140, 460 180" strokeWidth="2" />
          <path d="M 180 90 C 210 70, 250 80, 230 110" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
