import React from 'react';

interface DongHoProps {
  className?: string;
  color?: string;
  opacity?: number;
}

/**
 * Tranh dân gian Đông Hồ: "Mục đồng chăn trâu thổi sáo" (Image 5)
 * Biểu tượng thanh bình, mộc mạc và tươi vui của văn hóa truyền thống Việt Nam:
 * - Cậu bé mục đồng ngồi vắt vẻo trên lưng trâu, ngửa mặt thổi sáo trúc
 * - Tán lá sen lớn che nắng tỏa bóng
 * - Chú trâu béo tốt nghểnh đầu lắng nghe tiếng sáo
 * - Khóm cỏ đồng nội và dòng chữ đề thơ Nôm dân gian
 */
export const DongHoFluteBuffaloHeritage: React.FC<DongHoProps> = ({
  className = '',
  color = '#2C241D',
  opacity = 0.12
}) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <svg
        viewBox="0 0 500 650"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Khung viền tranh Đông Hồ mộc mạc */}
        <rect x="25" y="25" width="450" height="600" rx="8" strokeWidth="2.5" strokeDasharray="8 4" />

        {/* Chữ Nôm đề thơ góc trên bên phải (Image 5) */}
        <g id="chu-nom-dong-ho" strokeWidth="2" fill={color} fillOpacity="0.8">
          {/* Cột chữ Hán - Nôm truyền thống */}
          <path d="M 400 70 L 415 65 L 410 80 M 395 78 L 420 78 M 405 78 L 405 105" />
          <path d="M 398 120 C 410 115, 420 125, 415 140 C 410 155, 395 150, 400 135" />
          <path d="M 402 160 L 418 155 L 412 180 M 396 175 L 420 175" />
          <path d="M 395 200 C 405 190, 420 200, 415 220 L 405 240" />
        </g>

        {/* ================= TÁN LÁ SEN LỚN (IMAGE 5) ================= */}
        {/* Cuống lá sen dài vươn từ lưng trâu lên cao */}
        <path
          d="M 210 260 
             C 195 200, 185 140, 150 90"
          strokeWidth="3.5"
        />

        {/* Tán lá sen xòe rộng uốn lượn hình búp sóng */}
        <path
          d="M 150 90 
             C 120 70, 80 80, 60 110 
             C 45 140, 65 170, 95 180 
             C 125 190, 160 180, 185 150 
             C 210 120, 180 90, 150 90 Z"
          strokeWidth="3"
        />
        {/* Các đường gân lá sen xòe tròn */}
        <path d="M 135 140 L 80 115" strokeWidth="1.8" />
        <path d="M 135 140 L 75 150" strokeWidth="1.8" />
        <path d="M 135 140 L 105 170" strokeWidth="1.8" />
        <path d="M 135 140 L 160 165" strokeWidth="1.8" />
        <path d="M 135 140 L 165 125" strokeWidth="1.8" />
        <path d="M 135 140 L 140 100" strokeWidth="1.8" />

        {/* Búp sen non hé nở cạnh lá sen */}
        <path d="M 235 240 C 230 205, 235 190, 245 175 C 255 190, 260 205, 255 240 Z" strokeWidth="2.5" />
        <line x1="245" y1="175" x2="245" y2="240" strokeWidth="1.8" />

        {/* ================= MỤC ĐỒNG THỔI SÁO TRÚC (IMAGE 5) ================= */}
        {/* Đầu cậu bé ngửa ra sau, khuôn mặt tươi vui */}
        <circle cx="155" cy="205" r="22" strokeWidth="2.5" />
        {/* Chỏm tóc quả đào trên đỉnh đầu */}
        <path d="M 155 183 C 150 170, 160 168, 158 178" strokeWidth="3" />
        {/* Mắt, mũi, miệng tươi cười */}
        <circle cx="162" cy="202" r="2.5" fill={color} />
        <path d="M 166 212 C 162 216, 156 214, 154 212" strokeWidth="2" />

        {/* Cây sáo trúc nằm ngang qua miệng */}
        <line x1="115" y1="225" x2="255" y2="185" strokeWidth="3.5" />
        {/* Lỗ sáo trúc */}
        <circle cx="190" cy="203" r="1.8" fill={color} />
        <circle cx="205" cy="199" r="1.8" fill={color} />
        <circle cx="220" cy="195" r="1.8" fill={color} />
        {/* Dải tua đỏ đuôi sáo đung đưa */}
        <path d="M 245 188 C 255 205, 250 220, 240 230" strokeWidth="2" />

        {/* Hai cánh tay mục đồng nâng sáo trúc */}
        <path d="M 140 230 C 135 220, 145 210, 158 215" strokeWidth="2.5" />
        <path d="M 175 225 C 185 215, 195 205, 205 200" strokeWidth="2.5" />

        {/* Thân mình mũm mĩm và yếm đào dân gian */}
        <path d="M 145 225 C 140 245, 155 275, 175 275 C 195 275, 205 245, 195 225 Z" strokeWidth="2.5" />
        {/* Chân khoanh trên lưng trâu */}
        <path d="M 150 260 C 135 270, 125 285, 140 295 C 155 290, 165 275, 160 265" strokeWidth="2.5" />
        <path d="M 180 265 C 195 275, 205 288, 195 298 C 185 292, 175 278, 180 265" strokeWidth="2.5" />

        {/* Yên hoa văn hoa cúc trên lưng trâu (Image 5) */}
        <ellipse cx="175" cy="300" rx="35" ry="18" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="175" cy="300" r="6" strokeWidth="1.5" />

        {/* ================= CHÚ TRÂU ĐỒNG OAI VỆ (IMAGE 5) ================= */}
        {/* Cặp sừng trâu cong vút oai nghiêm */}
        <path d="M 305 240 C 300 200, 280 180, 260 175 C 275 195, 290 220, 295 250" strokeWidth="3.5" />
        <path d="M 330 245 C 345 210, 365 190, 390 185 C 375 205, 360 230, 350 255" strokeWidth="3.5" />

        {/* Đầu trâu nghển lên nghe tiếng sáo */}
        <path
          d="M 290 250 
             C 320 235, 365 240, 400 265 
             C 415 280, 405 310, 380 320 
             C 340 330, 305 305, 280 275 Z"
          strokeWidth="3"
        />
        {/* Mắt trâu to tròn hiền lành */}
        <ellipse cx="340" cy="275" rx="7" ry="5" strokeWidth="2" />
        <circle cx="340" cy="275" r="3" fill={color} />
        {/* Lỗ mũi trâu và dây thừng xỏ mũi */}
        <circle cx="395" cy="290" r="3.5" strokeWidth="2" />
        <path d="M 395 295 C 410 320, 390 350, 350 370" strokeWidth="2" strokeDasharray="3 3" />

        {/* Thân và bụng trâu mập mạp vững vàng */}
        <path
          d="M 120 280 
             C 170 270, 240 275, 280 285 
             C 320 320, 310 380, 290 440 
             C 240 455, 160 450, 110 420 
             C 80 380, 90 310, 120 280 Z"
          strokeWidth="3.5"
        />

        {/* Các nếp ngấn cổ và bụng trâu (Image 5) */}
        <path d="M 275 310 C 265 330, 270 360, 290 380" strokeWidth="2" />
        <path d="M 250 325 C 240 345, 245 375, 265 395" strokeWidth="2" />
        <path d="M 225 340 C 215 360, 220 390, 240 410" strokeWidth="2" />

        {/* Bốn chân trâu guốc khỏe khoắn */}
        <path d="M 115 410 L 105 480 L 100 560 L 125 560 L 130 480" strokeWidth="3" />
        <path d="M 155 425 L 150 495 L 145 565 L 170 565 L 175 495" strokeWidth="3" />
        <path d="M 265 435 L 268 505 L 270 570 L 295 570 L 292 505" strokeWidth="3" />
        <path d="M 305 415 L 310 490 L 315 555 L 340 555 L 332 490" strokeWidth="3" />

        {/* Móng guốc trâu */}
        <line x1="98" y1="550" x2="127" y2="550" strokeWidth="2.5" />
        <line x1="143" y1="555" x2="172" y2="555" strokeWidth="2.5" />
        <line x1="268" y1="560" x2="297" y2="560" strokeWidth="2.5" />
        <line x1="313" y1="545" x2="342" y2="545" strokeWidth="2.5" />

        {/* Đuôi trâu vắt mềm mại */}
        <path d="M 95 330 C 75 360, 65 410, 80 460 C 85 470, 75 480, 80 490" strokeWidth="3" />
        {/* Chùm lông đuôi trâu */}
        <path d="M 80 485 C 90 495, 85 515, 75 525 C 70 515, 75 495, 80 485 Z" fill={color} fillOpacity="0.4" />

        {/* ================= KHÓM CỎ ĐỒNG NỘI DÂN GIAN (IMAGE 5) ================= */}
        <g id="khom-co-dong-ho" transform="translate(60, 520)" strokeWidth="2">
          <path d="M 0 50 L 10 20 L 15 50" />
          <path d="M 10 20 L 25 10 L 20 50" />
          <path d="M 25 10 L 35 25 L 30 50" />
        </g>
        <g id="khom-co-dong-ho-2" transform="translate(360, 500)" strokeWidth="2">
          <path d="M 0 50 L 12 15 L 18 50" />
          <path d="M 12 15 L 28 5 L 24 50" />
          <path d="M 28 5 L 42 20 L 36 50" />
        </g>
      </svg>
    </div>
  );
};
