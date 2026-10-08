import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/images/accessories');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Nón Ba Tầm (Nón Quai Thao)
const nonBaTamSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDFBF7"/>
      <stop offset="100%" stop-color="#EBE3D5"/>
    </radialGradient>
    <radialGradient id="hatTopGrad" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FCEFD8"/>
      <stop offset="60%" stop-color="#DFC49B"/>
      <stop offset="100%" stop-color="#B39366"/>
    </radialGradient>
    <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9B2226"/>
      <stop offset="40%" stop-color="#C53030"/>
      <stop offset="70%" stop-color="#E9C46A"/>
      <stop offset="100%" stop-color="#9B2226"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#4A3423" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad)"/>
  
  <!-- Subtle pattern circle -->
  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>
  <circle cx="300" cy="300" r="260" fill="none" stroke="#D1C2A5" stroke-width="1" opacity="0.4"/>

  <!-- Hanging Quai Thao Silk Ribbon behind hat -->
  <g filter="url(#shadow)">
    <!-- Left Ribbon -->
    <path d="M 210 280 C 190 350, 170 420, 185 510 C 190 530, 205 525, 200 500 C 185 420, 210 360, 225 290 Z" fill="url(#tasselGrad)"/>
    <!-- Left Tassel fringe -->
    <path d="M 185 510 L 175 550 M 188 510 L 183 555 M 193 508 L 192 553 M 198 505 L 202 548" stroke="#9B2226" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Right Ribbon -->
    <path d="M 390 280 C 410 350, 430 420, 415 510 C 410 530, 395 525, 400 500 C 415 420, 390 360, 375 290 Z" fill="url(#tasselGrad)"/>
    <!-- Right Tassel fringe -->
    <path d="M 415 510 L 425 550 M 412 510 L 417 555 M 407 508 L 408 553 M 402 505 L 398 548" stroke="#9B2226" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Nón Ba Tầm (Main Flat Disc Hat) -->
  <g filter="url(#shadow)">
    <!-- Outer rim / edge thickness -->
    <ellipse cx="300" cy="270" rx="210" ry="110" fill="#9C7F55"/>
    <!-- Upper main surface -->
    <ellipse cx="300" cy="265" rx="205" ry="105" fill="url(#hatTopGrad)"/>
    <!-- Concentric woven rings -->
    <ellipse cx="300" cy="265" rx="180" ry="92" fill="none" stroke="#C5AA80" stroke-width="1.5"/>
    <ellipse cx="300" cy="265" rx="150" ry="76" fill="none" stroke="#BA9E72" stroke-width="1.5"/>
    <ellipse cx="300" cy="265" rx="115" ry="58" fill="none" stroke="#AF9165" stroke-width="1.5"/>
    <ellipse cx="300" cy="265" rx="75" ry="38" fill="none" stroke="#A48457" stroke-width="1.5"/>
    
    <!-- Center dome (Chóp nón dẹt) -->
    <ellipse cx="300" cy="262" rx="42" ry="22" fill="#E8D5B7" stroke="#8C6E42" stroke-width="2"/>
    <ellipse cx="300" cy="260" rx="22" ry="11" fill="#C5AA80"/>

    <!-- Woven leaf texture lines radiating outward -->
    <g stroke="#C5A87B" stroke-width="0.8" opacity="0.65">
      <line x1="300" y1="262" x2="105" y2="245"/>
      <line x1="300" y1="262" x2="495" y2="245"/>
      <line x1="300" y1="262" x2="135" y2="310"/>
      <line x1="300" y1="262" x2="465" y2="310"/>
      <line x1="300" y1="262" x2="200" y2="355"/>
      <line x1="300" y1="262" x2="400" y2="355"/>
      <line x1="300" y1="262" x2="300" y2="370"/>
      <line x1="300" y1="262" x2="200" y2="175"/>
      <line x1="300" y1="262" x2="400" y2="175"/>
      <line x1="300" y1="262" x2="300" y2="160"/>
    </g>

    <!-- Quai Thao attachment nodes on brim -->
    <circle cx="215" cy="285" r="9" fill="#9B2226" stroke="#FAF0CA" stroke-width="2.5"/>
    <circle cx="385" cy="285" r="9" fill="#9B2226" stroke="#FAF0CA" stroke-width="2.5"/>
  </g>

  <!-- Traditional typography emblem overlay -->
  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">NÓN BA TẦM • KINH BẮC</text>
  </g>
</svg>`;

// 2. Nón Lá (Nón Chuông / Nón Bài Thơ Huế)
const nonLaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <linearGradient id="coneLight" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FFFDF8"/>
      <stop offset="45%" stop-color="#F4E8D4"/>
      <stop offset="85%" stop-color="#D6BE9C"/>
      <stop offset="100%" stop-color="#B79C77"/>
    </linearGradient>
    <filter id="shadowCone" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#423122" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad2)"/>

  <!-- Soft background watermark ring -->
  <circle cx="300" cy="300" r="250" fill="none" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="8,8" opacity="0.5"/>

  <!-- Nón Lá Cone Structure -->
  <g filter="url(#shadowCone)">
    <!-- Base Ellipse shadow rim -->
    <ellipse cx="300" cy="410" rx="200" ry="48" fill="#A88B63"/>

    <!-- Main Conical Body -->
    <path d="M 300 130 L 100 410 C 180 435, 420 435, 500 410 Z" fill="url(#coneLight)"/>

    <!-- 16 Horizontal bamboo ribs (vành nón) -->
    <path d="M 120 395 C 190 417, 410 417, 480 395" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 140 375 C 200 395, 400 395, 460 375" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 160 355 C 215 373, 385 373, 440 355" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 180 335 C 230 350, 370 350, 420 335" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 200 315 C 240 328, 360 328, 400 315" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 220 295 C 255 306, 345 306, 380 295" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 240 270 C 265 280, 335 280, 360 270" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 255 245 C 275 253, 325 253, 345 245" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 270 215 C 285 222, 315 222, 330 215" fill="none" stroke="#C9B28F" stroke-width="1.5"/>
    <path d="M 285 180 C 292 185, 308 185, 315 180" fill="none" stroke="#C9B28F" stroke-width="1.5"/>

    <!-- Subtle Poem / Leaf silhouette inside layer (Nón Bài Thơ) -->
    <path d="M 275 320 Q 300 310, 325 320 Q 315 340, 285 338 Z" fill="#7D6544" opacity="0.18"/>
    <path d="M 260 345 Q 300 335, 340 345 Q 330 365, 270 360 Z" fill="#7D6544" opacity="0.15"/>
    <!-- Small bamboo bridge & Pagoda watermark -->
    <path d="M 280 375 L 320 375 L 315 365 L 285 365 Z" fill="#7D6544" opacity="0.18"/>

    <!-- Top Cap (chóp nón mạ chỉ trắng) -->
    <path d="M 292 145 Q 300 120, 308 145 Z" fill="#F4EDE2" stroke="#A88B63" stroke-width="1.5"/>

    <!-- Silk Chin Strap (Quai Nón Lụa Hồng Đào) -->
    <path d="M 215 415 C 240 480, 270 515, 300 520 C 330 515, 360 480, 385 415" fill="none" stroke="#D96B7E" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 295 518 C 298 545, 302 545, 305 518" fill="#C53030"/>
  </g>

  <g transform="translate(300, 565)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">NÓN LÁ BÀI THƠ • XỨ HUẾ</text>
  </g>
</svg>`;

// 3. Khăn Đóng (Khăn Xếp Quấn Nếp Chữ Nhân)
const khanDongSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FBF9F4"/>
      <stop offset="100%" stop-color="#E5DC handle"/>
      <stop offset="100%" stop-color="#E2D7C5"/>
    </radialGradient>
    <linearGradient id="silkBrocade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D3142"/>
      <stop offset="30%" stop-color="#1F222E"/>
      <stop offset="70%" stop-color="#141722"/>
      <stop offset="100%" stop-color="#0A0B10"/>
    </linearGradient>
    <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#F3E5AB"/>
      <stop offset="100%" stop-color="#AA820A"/>
    </linearGradient>
    <filter id="shadowHat" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#1A1815" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad3)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Khăn Đóng Form -->
  <g filter="url(#shadowHat)">
    <!-- Base circular crown -->
    <ellipse cx="300" cy="275" rx="195" ry="115" fill="#141722"/>
    
    <!-- Top opening / hair knot area -->
    <ellipse cx="300" cy="255" rx="145" ry="85" fill="#0A0B10" stroke="#3A3D4D" stroke-width="2"/>
    
    <!-- Layered pleat folds (Nếp quấn chữ Nhân) -->
    <!-- Fold 1 (Outer) -->
    <path d="M 115 285 C 130 360, 220 395, 300 395 C 380 395, 470 360, 485 285 C 490 270, 480 250, 470 240 C 420 325, 360 360, 300 360 C 240 360, 180 325, 130 240 Z" fill="url(#silkBrocade)"/>

    <!-- Fold 2 (Middle) -->
    <path d="M 130 275 C 145 340, 225 375, 300 375 C 375 375, 455 340, 470 275 C 440 330, 370 350, 300 350 C 230 350, 160 330, 130 275 Z" fill="#242838"/>

    <!-- Distinctive "Chữ Nhân" (人) / "Chữ Nhất" Cross Fold in the center front -->
    <!-- Left diagonal flap -->
    <path d="M 215 315 Q 295 385, 345 390 L 325 405 Q 275 385, 195 330 Z" fill="#3A3F56" stroke="url(#goldEdge)" stroke-width="1.2"/>
    <!-- Right diagonal overlapping flap -->
    <path d="M 385 315 Q 305 385, 255 390 L 275 405 Q 325 385, 405 330 Z" fill="#2D3246" stroke="url(#goldEdge)" stroke-width="1.2"/>

    <!-- Subtle silk sheen lines -->
    <path d="M 160 300 Q 300 380, 440 300" fill="none" stroke="#484E69" stroke-width="1" opacity="0.6"/>
    <path d="M 175 320 Q 300 390, 425 320" fill="none" stroke="#484E69" stroke-width="1" opacity="0.6"/>
    <path d="M 190 340 Q 300 400, 410 340" fill="none" stroke="#484E69" stroke-width="1" opacity="0.6"/>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">KHĂN ĐÓNG CHỮ NHÂN • TRIỀU NGUYỄN</text>
  </g>
</svg>`;

// 4. Khăn Vành Dây Hoàng Tộc
const khanVanhDaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad4" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#EAE0D0"/>
    </radialGradient>
    <linearGradient id="goldSilk" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FBE790"/>
      <stop offset="35%" stop-color="#E5B834"/>
      <stop offset="70%" stop-color="#B8860B"/>
      <stop offset="100%" stop-color="#7B5704"/>
    </linearGradient>
    <linearGradient id="rubyGem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E63946"/>
      <stop offset="60%" stop-color="#9B2226"/>
      <stop offset="100%" stop-color="#540B0E"/>
    </linearGradient>
    <filter id="goldGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#543A08" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad4)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Khăn Vành Dây Hoàng Cung (Quấn nhiều vòng gấm kim tuyến) -->
  <g filter="url(#goldGlow)">
    <!-- Back halo rim -->
    <ellipse cx="300" cy="270" rx="195" ry="145" fill="#8C6605"/>
    <ellipse cx="300" cy="270" rx="180" ry="130" fill="url(#goldSilk)"/>

    <!-- Concentric wound fabric turns (Vành dây quấn lớp lớp) -->
    <ellipse cx="300" cy="275" rx="165" ry="118" fill="none" stroke="#FFEAA7" stroke-width="4"/>
    <ellipse cx="300" cy="278" rx="150" ry="106" fill="none" stroke="#B8860B" stroke-width="3"/>
    <ellipse cx="300" cy="282" rx="135" ry="94" fill="none" stroke="#FFEAA7" stroke-width="4"/>
    <ellipse cx="300" cy="286" rx="120" ry="82" fill="none" stroke="#B8860B" stroke-width="3"/>
    <ellipse cx="300" cy="290" rx="105" ry="70" fill="none" stroke="#FFEAA7" stroke-width="4"/>
    
    <!-- Inner head hollow -->
    <ellipse cx="300" cy="295" rx="85" ry="55" fill="#2C241D"/>

    <!-- Front thick crown drape -->
    <path d="M 125 295 C 135 410, 230 450, 300 450 C 370 450, 465 410, 475 295 C 440 375, 370 410, 300 410 C 230 410, 160 375, 125 295 Z" fill="url(#goldSilk)"/>

    <!-- Imperial Brocade embroidery textures (Mây lành ngũ sắc) -->
    <path d="M 180 340 Q 300 435, 420 340" fill="none" stroke="#FFF3B0" stroke-width="2" opacity="0.8"/>
    <path d="M 160 365 Q 300 455, 440 365" fill="none" stroke="#FFF3B0" stroke-width="2" opacity="0.8"/>

    <!-- Imperial Gold Jewel Brooch in center (Ngọc ngọc bội kim khôi) -->
    <circle cx="300" cy="425" r="16" fill="url(#rubyGem)" stroke="#FFF9DB" stroke-width="3"/>
    <circle cx="300" cy="425" r="7" fill="#FFD166"/>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">KHĂN VÀNH DÂY • CUNG ĐÌNH HUẾ</text>
  </g>
</svg>`;

// 5. Kiềng Bạc Chạm Hoa Mai
const kiengBacSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad5" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FAF8F5"/>
      <stop offset="100%" stop-color="#E2D9CC"/>
    </radialGradient>
    <linearGradient id="silverGloss" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="25%" stop-color="#E0E6ED"/>
      <stop offset="50%" stop-color="#C5CFD9"/>
      <stop offset="75%" stop-color="#9BA5B1"/>
      <stop offset="100%" stop-color="#E9EEF4"/>
    </linearGradient>
    <filter id="silverGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="15" flood-color="#2D3748" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad5)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Kiềng Bạc Cổ Form (Solid Torc Collar) -->
  <g filter="url(#silverGlow)">
    <!-- Main Silver Ring -->
    <path d="M 175 190 C 130 250, 130 380, 205 440 C 265 485, 335 485, 395 440 C 470 380, 470 250, 425 190" 
          fill="none" stroke="url(#silverGloss)" stroke-width="32" stroke-linecap="round"/>

    <!-- Inner Core Highlight for 3D Tubular Metallic Effect -->
    <path d="M 175 190 C 130 250, 130 380, 205 440 C 265 485, 335 485, 395 440 C 470 380, 470 250, 425 190" 
          fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.8"/>

    <!-- Left Terminal Finial (Chạm khắc đầu rồng / hoa mai) -->
    <g transform="translate(175, 190)">
      <circle cx="0" cy="0" r="22" fill="url(#silverGloss)" stroke="#718096" stroke-width="2"/>
      <!-- Blossom carved petals -->
      <circle cx="-6" cy="-6" r="5" fill="#E2E8F0"/>
      <circle cx="6" cy="-6" r="5" fill="#E2E8F0"/>
      <circle cx="6" cy="6" r="5" fill="#E2E8F0"/>
      <circle cx="-6" cy="6" r="5" fill="#E2E8F0"/>
      <circle cx="0" cy="0" r="4" fill="#A0AEC0"/>
    </g>

    <!-- Right Terminal Finial -->
    <g transform="translate(425, 190)">
      <circle cx="0" cy="0" r="22" fill="url(#silverGloss)" stroke="#718096" stroke-width="2"/>
      <circle cx="-6" cy="-6" r="5" fill="#E2E8F0"/>
      <circle cx="6" cy="-6" r="5" fill="#E2E8F0"/>
      <circle cx="6" cy="6" r="5" fill="#E2E8F0"/>
      <circle cx="-6" cy="6" r="5" fill="#E2E8F0"/>
      <circle cx="0" cy="0" r="4" fill="#A0AEC0"/>
    </g>

    <!-- Center Pendant / Engraved motif at bottom apex -->
    <g transform="translate(300, 465)">
      <polygon points="0,-15 12,0 0,15 -12,0" fill="#CBD5E0" stroke="#718096" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    </g>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">KIỀNG BẠC CHẠM HOA MAI • CỔ TRUYỀN</text>
  </g>
</svg>`;

// 6. Guốc Mộc (Guốc Gỗ Xưa / Guốc Sơn Then)
const guocMocSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad6" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EED7B7"/>
      <stop offset="40%" stop-color="#CFA577"/>
      <stop offset="85%" stop-color="#9E7649"/>
      <stop offset="100%" stop-color="#6B4B27"/>
    </linearGradient>
    <linearGradient id="strapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7B1113"/>
      <stop offset="50%" stop-color="#A82024"/>
      <stop offset="100%" stop-color="#670B0D"/>
    </linearGradient>
    <filter id="clogShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#3B2615" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad6)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <g filter="url(#clogShadow)">
    <!-- LEFT CLOG (Guốc Trái) -->
    <g transform="translate(160, 160) rotate(-12)">
      <!-- Sole shadow profile -->
      <path d="M 30 180 C 15 100, 30 40, 60 20 C 90 20, 105 70, 100 140 C 95 210, 105 280, 95 320 C 85 350, 45 350, 35 320 C 25 280, 40 230, 30 180 Z" fill="url(#woodGrad)" stroke="#7A542E" stroke-width="2"/>
      
      <!-- Elevated Heel Block (Gót guốc) -->
      <path d="M 40 260 L 90 260 L 85 330 L 45 330 Z" fill="#6B4823"/>

      <!-- Velvet Strap (Quai guốc nhung đỏ) -->
      <path d="M 20 120 C 20 70, 110 70, 110 120 C 110 135, 20 135, 20 120 Z" fill="url(#strapGrad)" stroke="#E9C46A" stroke-width="2"/>
      <circle cx="25" cy="125" r="4.5" fill="#D4AF37"/>
      <circle cx="105" cy="125" r="4.5" fill="#D4AF37"/>
    </g>

    <!-- RIGHT CLOG (Guốc Phải) -->
    <g transform="translate(320, 160) rotate(12)">
      <!-- Sole profile -->
      <path d="M 80 180 C 95 100, 80 40, 50 20 C 20 20, 5 70, 10 140 C 15 210, 5 280, 15 320 C 25 350, 65 350, 75 320 C 85 280, 70 230, 80 180 Z" fill="url(#woodGrad)" stroke="#7A542E" stroke-width="2"/>
      
      <!-- Elevated Heel Block -->
      <path d="M 20 260 L 70 260 L 65 330 L 25 330 Z" fill="#6B4823"/>

      <!-- Velvet Strap -->
      <path d="M 0 120 C 0 70, 90 70, 90 120 C 90 135, 0 135, 0 120 Z" fill="url(#strapGrad)" stroke="#E9C46A" stroke-width="2"/>
      <circle cx="5" cy="125" r="4.5" fill="#D4AF37"/>
      <circle cx="85" cy="125" r="4.5" fill="#D4AF37"/>
    </g>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">GUỐC MỘC QUAI NHUNG • HỒN QUÊ XƯA</text>
  </g>
</svg>`;

// 7. Hài Thêu Phụng Mũi Cong (Hài Cung Đình)
const haiTheuSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad7" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <linearGradient id="silkRed" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#B21E27"/>
      <stop offset="60%" stop-color="#800E13"/>
      <stop offset="100%" stop-color="#4F0508"/>
    </linearGradient>
    <linearGradient id="goldThread" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEB80"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#997A15"/>
    </linearGradient>
    <filter id="shoeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#4A1517" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad7)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Hài Thêu Mũi Cong Cung Đình -->
  <g filter="url(#shoeShadow)">
    <g transform="translate(130, 200)">
      <!-- White cloth sole base (Đế hài nhiều lớp) -->
      <path d="M 40 180 C 120 180, 260 175, 330 160 C 350 150, 365 120, 355 90 L 340 92 C 345 110, 335 130, 310 140 C 240 155, 120 160, 40 160 Z" fill="#F4EFE6" stroke="#D8CFC0" stroke-width="2"/>

      <!-- Main Upper Shoe Brocade (Thân hài gấm đỏ son) -->
      <path d="M 40 160 C 35 110, 80 60, 140 60 C 190 60, 240 90, 290 120 C 330 140, 355 125, 360 90 C 365 65, 345 50, 325 55 C 345 35, 385 45, 375 95 C 365 145, 320 160, 280 155 C 200 150, 100 155, 40 160 Z" 
            fill="url(#silkRed)"/>

      <!-- Distinctive Curved Toe (Mũi hài vuốt cong vút thêu chỉ vàng) -->
      <path d="M 320 115 C 350 115, 375 90, 365 60 C 355 35, 335 45, 345 65" fill="none" stroke="url(#goldThread)" stroke-width="4.5" stroke-linecap="round"/>

      <!-- Phoenix & Cloud Gold Embroidery Motifs (Họa tiết Phụng vũ) -->
      <path d="M 120 110 Q 180 80, 220 115 Q 160 140, 120 110 Z" fill="none" stroke="url(#goldThread)" stroke-width="2"/>
      <path d="M 150 100 C 180 90, 200 110, 240 105" fill="none" stroke="url(#goldThread)" stroke-width="2"/>
      <!-- Cloud swirls -->
      <circle cx="100" cy="110" r="10" fill="none" stroke="url(#goldThread)" stroke-width="1.8"/>
      <circle cx="260" cy="130" r="8" fill="none" stroke="url(#goldThread)" stroke-width="1.8"/>

      <!-- Shoe opening collar (Viền cổ hài) -->
      <ellipse cx="140" cy="75" rx="45" ry="18" fill="#4F0508" stroke="url(#goldThread)" stroke-width="2"/>
    </g>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">HÀI THÊU MŨI CONG • CUNG ĐÌNH NGUYỄN</text>
  </g>
</svg>`;

// 8. Quạt Xếp Trầm Hương
const quatTramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad8" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <linearGradient id="silkPaper" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FDF8EB"/>
      <stop offset="50%" stop-color="#F2E3C6"/>
      <stop offset="100%" stop-color="#DFCCA4"/>
    </linearGradient>
    <linearGradient id="ribWood" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9C6B38"/>
      <stop offset="100%" stop-color="#543615"/>
    </linearGradient>
    <filter id="fanShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#4A3423" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad8)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Folded / Spread Fan Structure -->
  <g filter="url(#fanShadow)" transform="translate(0, 50)">
    <!-- Fan Leaf Arc (Mặt quạt lụa giấy dó) -->
    <path d="M 120 280 C 190 140, 410 140, 480 280 L 370 325 C 330 250, 270 250, 230 325 Z" 
          fill="url(#silkPaper)" stroke="#C8B38E" stroke-width="2"/>

    <!-- Delicate ink landscape painting on fan (Tranh thủy mặc non nước) -->
    <path d="M 210 230 Q 250 190, 290 225 Q 330 180, 380 235" fill="none" stroke="#7A6546" stroke-width="2.5" opacity="0.6"/>
    <path d="M 260 215 L 265 205 L 270 215 Z" fill="#7A6546" opacity="0.5"/>
    <circle cx="320" cy="180" r="14" fill="#C53030" opacity="0.45"/> <!-- Red Sun Stamp -->

    <!-- Fan Ribs radiating from pivot (Nan quạt trầm hương) -->
    <g stroke="url(#ribWood)" stroke-width="3.5" stroke-linecap="round">
      <line x1="300" y1="410" x2="120" y2="280"/>
      <line x1="300" y1="410" x2="160" y2="230"/>
      <line x1="300" y1="410" x2="210" y2="190"/>
      <line x1="300" y1="410" x2="265" y2="165"/>
      <line x1="300" y1="410" x2="335" y2="165"/>
      <line x1="300" y1="410" x2="390" y2="190"/>
      <line x1="300" y1="410" x2="440" y2="230"/>
      <line x1="300" y1="410" x2="480" y2="280"/>
    </g>

    <!-- Pivot Rivet (Khuy trục quạt) -->
    <circle cx="300" cy="410" r="12" fill="#D4AF37" stroke="#65451A" stroke-width="2"/>

    <!-- Hanging Jade Bead & Silk Tassel (Tua rua chỉ đỏ & ngọc bội) -->
    <circle cx="300" cy="440" r="8" fill="#52B788" stroke="#2D6A4F" stroke-width="1.5"/>
    <path d="M 300 448 L 290 520 M 300 448 L 300 525 M 300 448 L 310 520" stroke="#9B2226" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">QUẠT XẾP TRẦM HƯƠNG • PHONG NHÃ</text>
  </g>
</svg>`;

// 9. Túi Gấm Cung Đình Thêu Hoa Sen
const tuiGamSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad9" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <linearGradient id="brocadePouch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D3557"/>
      <stop offset="50%" stop-color="#2A4871"/>
      <stop offset="100%" stop-color="#0E1E33"/>
    </linearGradient>
    <filter id="pouchShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#14213D" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad9)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Silk Brocade Drawstring Pouch -->
  <g filter="url(#pouchShadow)">
    <!-- Silk hanging cords -->
    <path d="M 300 80 L 270 200 M 300 80 L 330 200" stroke="#D4AF37" stroke-width="4" stroke-linecap="round"/>
    <circle cx="300" cy="80" r="8" fill="#9B2226"/>

    <!-- Pouch Neck Ruffles (Miệng túi túm nếp) -->
    <path d="M 230 190 Q 300 215, 370 190 L 380 230 Q 300 250, 220 230 Z" fill="#D4AF37"/>

    <!-- Main Bag Body (Thân túi gấm phồng tròn) -->
    <path d="M 225 225 C 160 260, 150 410, 220 460 C 270 495, 330 495, 380 460 C 450 410, 440 260, 375 225 Z" fill="url(#brocadePouch)" stroke="#D4AF37" stroke-width="2"/>

    <!-- Lotus Embroidery in Center (Thêu Hoa Sen vàng) -->
    <g transform="translate(300, 350)">
      <path d="M 0 -35 C -20 -15, -25 20, 0 35 C 25 20, 20 -15, 0 -35 Z" fill="#E9C46A" stroke="#FAF0CA" stroke-width="1.5"/>
      <path d="M -15 -15 C -40 0, -35 25, -5 32 Z" fill="#D4AF37"/>
      <path d="M 15 -15 C 40 0, 35 25, 5 32 Z" fill="#D4AF37"/>
      <!-- Water ripples below lotus -->
      <path d="M -40 45 Q 0 55, 40 45 M -30 55 Q 0 65, 30 55" fill="none" stroke="#E9C46A" stroke-width="2"/>
    </g>

    <!-- Golden bottom tassels -->
    <circle cx="300" cy="485" r="9" fill="#9B2226"/>
    <path d="M 292 494 L 285 540 M 300 494 L 300 545 M 308 494 L 315 540" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">TÚI GẤM CUNG ĐÌNH • HOA SEN CHỈ VÀNG</text>
  </g>
</svg>`;

// 10. Khăn Rằn Nam Bộ
const khanRanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad10" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </radialGradient>
    <pattern id="checkPattern" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="#2B2D42"/>
      <rect x="14" width="14" height="14" fill="#F4F4F6"/>
      <rect y="14" width="14" height="14" fill="#F4F4F6"/>
      <rect x="14" y="14" width="14" height="14" fill="#2B2D42"/>
    </pattern>
    <filter id="scarfShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#2B2D42" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad10)"/>

  <circle cx="300" cy="300" r="240" fill="none" stroke="#D1C2A5" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

  <!-- Draped Nam Bo Checkered Scarf -->
  <g filter="url(#scarfShadow)" transform="translate(0, 10)">
    <!-- Back neck loop -->
    <path d="M 210 160 C 240 120, 360 120, 390 160 C 430 220, 380 270, 300 270 C 220 270, 170 220, 210 160 Z" fill="url(#checkPattern)" stroke="#1F202E" stroke-width="2"/>

    <!-- Left tail draping down -->
    <path d="M 200 240 C 190 320, 170 420, 185 500 L 255 500 C 265 420, 280 320, 270 240 Z" fill="url(#checkPattern)" stroke="#1F202E" stroke-width="2"/>
    <!-- Left fringe -->
    <g stroke="#F4F4F6" stroke-width="2.5" stroke-linecap="round">
      <line x1="188" y1="500" x2="185" y2="535"/>
      <line x1="202" y1="500" x2="200" y2="538"/>
      <line x1="216" y1="500" x2="215" y2="536"/>
      <line x1="230" y1="500" x2="231" y2="539"/>
      <line x1="244" y1="500" x2="246" y2="535"/>
    </g>

    <!-- Right tail overlapping and draping down -->
    <path d="M 330 240 C 320 320, 335 410, 350 490 L 420 490 C 435 410, 410 320, 400 240 Z" fill="url(#checkPattern)" stroke="#1F202E" stroke-width="2"/>
    <!-- Right fringe -->
    <g stroke="#F4F4F6" stroke-width="2.5" stroke-linecap="round">
      <line x1="353" y1="490" x2="350" y2="525"/>
      <line x1="367" y1="490" x2="365" y2="528"/>
      <line x1="381" y1="490" x2="380" y2="526"/>
      <line x1="395" y1="490" x2="396" y2="529"/>
      <line x1="410" y1="490" x2="412" y2="525"/>
    </g>
  </g>

  <g transform="translate(300, 560)" text-anchor="middle">
    <text font-family="'Cinzel', serif, system-ui" font-size="15" font-weight="bold" fill="#755B3F" letter-spacing="4">KHĂN RẰN TRUYỀN THỐNG • NAM BỘ</text>
  </g>
</svg>`;

const files = [
  { name: 'non-ba-tam.svg', content: nonBaTamSvg },
  { name: 'non-la.svg', content: nonLaSvg },
  { name: 'khan-dong.svg', content: khanDongSvg },
  { name: 'khan-vanh-day.svg', content: khanVanhDaySvg },
  { name: 'kieng-bac.svg', content: kiengBacSvg },
  { name: 'guoc-moc.svg', content: guocMocSvg },
  { name: 'hai-theu.svg', content: haiTheuSvg },
  { name: 'quat-tram.svg', content: quatTramSvg },
  { name: 'tui-gam.svg', content: tuiGamSvg },
  { name: 'khan-ran.svg', content: khanRanSvg }
];

for (const f of files) {
  fs.writeFileSync(path.join(outDir, f.name), f.content, 'utf8');
  console.log(`Created ${f.name}`);
}
console.log('All 10 accessory SVG illustrations generated successfully!');
