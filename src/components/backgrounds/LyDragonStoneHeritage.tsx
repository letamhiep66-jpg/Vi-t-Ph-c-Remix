import React from 'react';

interface LyDragonStoneProps {
  className?: string;
  color?: string;
  opacity?: number;
}

/**
 * Họa tiết Rồng thời Lý chính thống khắc đá thế kỷ XI - XIII (Image 4)
 * Tuyệt tác điêu khắc triều Lý: Thân hình sin trơn lượn 11 nhịp nhấp nhô mềm mại,
 * đầu ngẩng cao ngậm ngọc báu tròn có hào quang, mào lửa dài uốn lượn, bờm tóc dài 3 dải,
 * chân móng chim thanh tú, thân rồng bao bọc bởi các dải mây lửa búp sen.
 */
export const LyDragonStoneHeritage: React.FC<LyDragonStoneProps> = ({
  className = '',
  color = '#2C241D',
  opacity = 0.12
}) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <svg
        viewBox="0 0 920 380"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Khung biên trên và dưới (Image 4) */}
        <line x1="20" y1="15" x2="900" y2="15" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="20" y1="365" x2="900" y2="365" strokeWidth="2" strokeDasharray="6 4" />

        {/* ================= ĐẦU RỒNG THỜI LÝ NGẬM NGỌC (IMAGE 4) ================= */}
        {/* Viên ngọc báu rồng ngậm trước miệng */}
        <circle cx="50" cy="115" r="14" strokeWidth="2.5" />
        <circle cx="50" cy="115" r="5" fill={color} fillOpacity="0.5" />
        {/* Dải mây đao lửa ngậm ngọc */}
        <path d="M 28 80 C 15 100, 30 140, 20 160 C 10 180, 45 150, 40 130" strokeWidth="2" />
        <circle cx="260" cy="50" r="10" strokeWidth="2" />

        {/* Đầu rồng và vòi rồng mềm mại */}
        <path
          d="M 160 140 
             C 140 130, 115 110, 100 80 
             C 90 60, 75 55, 60 70 
             C 50 85, 75 105, 90 120 
             C 105 135, 120 155, 150 160"
          strokeWidth="3"
        />

        {/* Mắt rồng thời Lý lồi tròn thanh nhã */}
        <circle cx="120" cy="100" r="8" strokeWidth="2" />
        <circle cx="120" cy="100" r="3.5" fill={color} />

        {/* Mào lửa thời Lý uốn búp sen lá đề trên đỉnh đầu */}
        <path
          d="M 90 60 
             C 85 30, 95 10, 125 -10 
             C 145 -25, 155 -10, 135 15 
             C 120 35, 110 60, 115 85"
          strokeWidth="2.5"
        />
        {/* Răng cưa nhấp nhô trên mào lửa */}
        <path d="M 125 5 C 135 -5, 145 -5, 150 10 C 145 20, 135 25, 125 30" strokeWidth="1.8" />

        {/* Bờm rồng thời Lý dài 3 dải uốn lượn thướt tha buông về sau (Image 4) */}
        <path d="M 140 125 C 160 100, 200 90, 230 60 M 230 60 C 250 40, 260 55, 245 75 C 220 95, 180 120, 150 135" strokeWidth="2.2" />
        <path d="M 145 140 C 175 125, 215 115, 245 90 C 265 75, 275 90, 255 105 C 225 125, 185 145, 155 150" strokeWidth="2" />
        <path d="M 150 155 C 185 145, 230 140, 260 120 C 275 110, 280 125, 265 135 C 235 150, 195 160, 160 162" strokeWidth="1.8" />

        {/* ================= THÂN RỒNG THỜI LÝ HÌNH SIN 11 KHÚC (IMAGE 4) ================= */}
        {/* Khúc 1: Uốn lên ngực */}
        <path
          d="M 160 160 
             C 190 200, 220 280, 270 260 
             C 320 240, 310 120, 360 80 
             C 410 40, 440 180, 490 220 
             C 540 260, 560 90, 610 80 
             C 660 70, 680 200, 730 200 
             C 770 200, 780 110, 820 100 
             C 850 90, 870 140, 890 120"
          strokeWidth="4"
        />

        {/* Nét bụng song song của rồng thời Lý có vảy chấm nhỏ */}
        <path
          d="M 170 175 
             C 200 215, 230 295, 280 275 
             C 330 255, 320 135, 370 95 
             C 420 55, 450 195, 500 235 
             C 550 275, 570 105, 620 95 
             C 670 85, 690 215, 740 215 
             C 780 215, 790 125, 830 115 
             C 860 105, 875 150, 895 130"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        {/* Vảy rồng hình cánh hoa nhỏ thanh thoát dọc sống lưng (Image 4) */}
        {[...Array(28)].map((_, i) => (
          <circle
            key={`scale-${i}`}
            cx={190 + i * 25}
            cy={170 + Math.sin(i * 0.8) * 70}
            r="3.5"
            strokeWidth="1.2"
            fill={color}
            fillOpacity="0.25"
          />
        ))}

        {/* ================= CHÂN MÓNG CHIM THANH TÚ THỜI LÝ (IMAGE 4) ================= */}
        {/* Chân trước 1 vươn lên mây */}
        <path d="M 210 210 C 190 240, 160 270, 130 290 L 115 315 M 115 315 L 95 320 M 115 315 L 110 335 M 115 315 L 130 330" strokeWidth="2.5" />
        {/* Chân trước 2 co về sau */}
        <path d="M 330 220 C 350 260, 370 290, 390 320 L 410 340 M 410 340 L 395 355 M 410 340 L 415 360 M 410 340 L 430 350" strokeWidth="2.5" />
        {/* Chân sau 1 */}
        <path d="M 530 190 C 550 230, 570 270, 600 295 L 615 320 M 615 320 L 600 335 M 615 320 L 620 340 M 615 320 L 635 330" strokeWidth="2.5" />
        {/* Chân sau 2 */}
        <path d="M 750 180 C 765 210, 780 245, 805 270 L 820 295 M 820 295 L 805 310 M 820 295 L 825 315 M 820 295 L 840 305" strokeWidth="2.5" />

        {/* ================= ĐUÔI RỒNG THON DÀI XOẮN ỐC TRIỀU LÝ ================= */}
        <path
          d="M 890 120 
             C 910 110, 920 135, 910 150 
             C 895 165, 875 150, 885 135 
             C 890 125, 905 130, 900 140"
          strokeWidth="2.2"
        />

        {/* Dải mây đao lửa hình lá bồ đề bao bọc chung quanh (Image 4) */}
        <path d="M 280 170 C 310 150, 340 180, 320 200 C 300 215, 275 195, 285 175" strokeWidth="1.8" />
        <path d="M 450 100 C 480 80, 510 110, 490 130 C 470 145, 445 125, 455 105" strokeWidth="1.8" />
        <path d="M 680 120 C 710 100, 740 130, 720 150 C 700 165, 675 145, 685 125" strokeWidth="1.8" />
      </svg>
    </div>
  );
};
