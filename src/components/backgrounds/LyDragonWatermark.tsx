import React from 'react';

interface LyDragonProps {
  className?: string;
  opacity?: number;
  color?: string;
  flipped?: boolean;
}

/**
 * Họa tiết Rồng thời Lý (thế kỷ XI - XIII)
 * Đặc trưng nghệ thuật triều Lý: Thân hình sin tròn trơn lẳn uốn lượn mềm mại thuôn dần về đuôi,
 * đầu ngẩng cao, miệng ngậm ngọc báu, mào lửa dài uốn lượn thướt tha, chân móng chim thanh thoát,
 * chung quanh là vân mây lửa cuộn.
 */
export const LyDragonWatermark: React.FC<LyDragonProps> = ({
  className = '',
  opacity = 0.05,
  color = '#800E13',
  flipped = false,
}) => {
  return (
    <div
      className={`pointer-events-none absolute select-none transition-opacity duration-700 ${className} ${
        flipped ? '-scale-x-100' : ''
      }`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="lyDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Thân Rồng thời Lý uốn lượn nhịp nhàng hình sin đặc trưng */}
        <g stroke="url(#lyDragonGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Sống lưng và thân rồng uốn lượn 6 nhịp sin thanh thoát */}
          <path
            d="M 120 220 
               C 140 160, 180 130, 220 170
               C 260 210, 270 270, 320 250
               C 370 230, 390 140, 430 160
               C 470 180, 480 250, 520 230
               C 550 215, 570 180, 590 190"
            strokeWidth="4"
          />

          {/* Bụng rồng song song uốn lượn */}
          <path
            d="M 125 235 
               C 145 180, 175 150, 215 185
               C 255 220, 265 285, 315 265
               C 365 245, 385 155, 425 175
               C 465 195, 475 265, 515 245
               C 545 230, 565 195, 585 200"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />

          {/* Đầu rồng thời Lý ngẩng cao, bờm lửa thướt tha */}
          {/* Hàm trên và vòi rồng ngậm ngọc */}
          <path
            d="M 120 220
               C 105 210, 95 190, 85 160
               C 80 145, 70 135, 55 130
               C 40 125, 30 135, 40 148
               C 50 160, 70 175, 75 195
               C 80 215, 95 230, 120 235"
            strokeWidth="3"
          />

          {/* Mào lửa thời Lý uốn cong hình búp sen / lá đề */}
          <path
            d="M 85 160
               C 80 130, 90 90, 120 60
               C 140 40, 150 55, 130 80
               C 115 100, 105 130, 110 160"
            strokeWidth="2.5"
          />
          <path
            d="M 100 130
               C 120 110, 150 95, 175 110
               C 160 125, 135 135, 120 150"
            strokeWidth="2"
          />

          {/* Viên ngọc báu rồng ngậm trước miệng */}
          <circle cx="35" cy="135" r="10" strokeWidth="2.5" />
          <circle cx="35" cy="135" r="4" fill={color} fillOpacity="0.4" />
          {/* Tia hào quang ngọc báu */}
          <path d="M 35 118 L 35 112 M 35 152 L 35 158 M 18 135 L 12 135 M 52 135 L 58 135" strokeWidth="2" />

          {/* Bờm rồng thời Lý xòe dài về sau */}
          <path
            d="M 110 180 C 130 160, 170 150, 190 120"
            strokeWidth="2"
          />
          <path
            d="M 118 195 C 145 185, 185 180, 205 155"
            strokeWidth="2"
          />

          {/* Chân móng chim thanh tú thời Lý (3 móng uốn cong như cánh hoa) */}
          {/* Chân trước 1 */}
          <path
            d="M 170 145 C 160 110, 150 85, 135 70 M 135 70 L 125 60 M 135 70 L 140 55 M 135 70 L 150 65"
            strokeWidth="2.5"
          />
          {/* Chân trước 2 */}
          <path
            d="M 235 210 C 240 250, 230 280, 215 310 M 215 310 L 200 325 M 215 310 L 215 330 M 215 310 L 230 325"
            strokeWidth="2.5"
          />
          {/* Chân sau 1 */}
          <path
            d="M 360 200 C 350 160, 335 135, 320 120 M 320 120 L 305 110 M 320 120 L 320 100 M 320 120 L 335 110"
            strokeWidth="2.5"
          />
          {/* Chân sau 2 */}
          <path
            d="M 450 200 C 465 240, 470 270, 485 300 M 485 300 L 475 315 M 485 300 L 490 320 M 485 300 L 505 310"
            strokeWidth="2.5"
          />

          {/* Đuôi rồng thon dài xoắn tròn như vân xoắn ốc triều Lý */}
          <path
            d="M 590 190 
               C 610 200, 620 230, 600 250
               C 580 270, 550 250, 560 230
               C 570 215, 590 220, 585 235"
            strokeWidth="2.5"
          />

          {/* Hoa cúc dây cách điệu cuộn tròn quanh thân rồng */}
          <g opacity="0.6">
            <circle cx="280" cy="120" r="14" strokeWidth="1.5" />
            <circle cx="280" cy="120" r="7" strokeWidth="1" />
            <path d="M 280 100 C 275 110, 285 110, 280 120 C 275 130, 285 130, 280 140" strokeWidth="1.2" />
            <path d="M 260 120 C 270 115, 270 125, 280 120 C 290 115, 290 125, 300 120" strokeWidth="1.2" />
          </g>

          {/* Dải mây hình lá bồ đề thời Lý */}
          <g opacity="0.5">
            <path
              d="M 330 310 C 360 300, 390 330, 410 320 C 430 310, 420 290, 400 295"
              strokeWidth="2"
            />
            <path
              d="M 180 340 C 150 350, 120 320, 100 335 C 80 350, 95 370, 115 365"
              strokeWidth="1.8"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
