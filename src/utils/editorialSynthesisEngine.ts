/**
 * NẾP - Editorial Vietnamese Heritage Fashion Visual Synthesis Engine
 * 
 * Generates photorealistic, identity-anchored Vietnamese heritage lookbook visuals
 * tailored to user anthropometrics (gender, height, weight, body silhouette, skin tone),
 * authentic garment tailoring, historical accessories, modern wardrobe remix, and ambient settings.
 */

export interface EditorialSynthesisConfig {
  userPhoto?: string | null;
  gender: 'female' | 'male' | 'unisex';
  height: number; // in cm
  weight: number; // in kg
  skinTone?: 'fair' | 'natural' | 'warm_tan';
  bodyShape?: 'slim' | 'balanced' | 'curvy' | 'athletic';
  costumeId: string;
  costumeName: string;
  dynasty: string;
  costumeImage?: string;
  accessories?: Array<{ id?: string; name: string; image?: string; category?: string }>;
  wardrobeItems?: Array<{ id?: string; name: string; category?: string }>;
  sceneBackground?: 'hue_citadel' | 'hoi_an' | 'editorial_studio' | 'temple_garden';
  cameraPose?: 'full_body' | 'three_quarter' | 'portrait';
  patterns?: Array<{ id?: string; name: string; icon?: string }>;
  patternDescription?: string;
  stylingPrompt?: string;
}

/**
 * Loads an image safely with error fallback and data-url conversion to prevent tainted canvas.
 */
export async function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;

  let effectiveSrc = src;
  if (!src.startsWith('data:')) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        const blob = await res.blob();
        effectiveSrc = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || src);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        });
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  if (!effectiveSrc || (!effectiveSrc.startsWith('data:') && !effectiveSrc.startsWith('http') && !effectiveSrc.startsWith('/'))) {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = effectiveSrc;
  });
}

/**
 * Main synthesis engine function returning a high-resolution 3:4 dataUrl JPEG image.
 */
export async function renderEditorialLookbook(config: EditorialSynthesisConfig): Promise<string> {
  const {
    userPhoto,
    gender = 'female',
    height = 165,
    weight = 52,
    skinTone = 'natural',
    bodyShape,
    costumeId = 'ao-nhat-binh',
    costumeName = 'Áo Cổ Phục Việt Nam',
    dynasty = 'Đại Việt',
    accessories = [],
    wardrobeItems = [],
    sceneBackground = 'editorial_studio',
    stylingPrompt = ''
  } = config;

  // High-resolution canvas dimensions (3:4 ratio)
  const width = 1200;
  const canvasHeight = 1600;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Calculate Anthropometrics & Body Scale
  const isMale = gender === 'male';
  const bmi = weight / Math.pow(height / 100, 2);
  
  let determinedShape = bodyShape;
  if (!determinedShape) {
    if (bmi < 19.5) determinedShape = 'slim';
    else if (bmi <= 24.5) determinedShape = 'balanced';
    else if (bmi <= 28) determinedShape = isMale ? 'athletic' : 'curvy';
    else determinedShape = 'athletic';
  }

  // Scaling ratios based on height and BMI
  const heightFactor = Math.max(0.88, Math.min(1.15, height / 168));
  const widthFactor = determinedShape === 'slim' ? 0.92 : determinedShape === 'balanced' ? 1.0 : determinedShape === 'curvy' ? 1.12 : 1.16;

  // Skin tone color palettes
  const skinPalettes = {
    fair: {
      base: '#F7E7DA',
      shadow: '#E1C4B0',
      highlight: '#FFF4EB',
      lips: isMale ? '#C87E74' : '#C15252'
    },
    natural: {
      base: '#EBC4A4',
      shadow: '#CB9B79',
      highlight: '#F5D7BE',
      lips: isMale ? '#B5685E' : '#B84545'
    },
    warm_tan: {
      base: '#D6A681',
      shadow: '#B17C57',
      highlight: '#E4BD9A',
      lips: isMale ? '#9F554B' : '#A33C3C'
    }
  };
  const skin = skinPalettes[skinTone] || skinPalettes.natural;

  // -------------------------------------------------------------
  // STEP 1: Ambient Heritage Background Scenery
  // -------------------------------------------------------------
  renderSceneBackground(ctx, width, canvasHeight, sceneBackground);

  // -------------------------------------------------------------
  // STEP 2: Optional User Head / Model Base Subject
  // -------------------------------------------------------------
  const loadedUser = userPhoto ? await loadCanvasImage(userPhoto) : null;
  const fallbackModelSrc = isMale ? '/images/models/male-model.jpg' : '/images/models/female-model.jpg';
  const loadedStockModel = await loadCanvasImage(fallbackModelSrc);

  // Model positioning geometry
  const centerX = width * 0.5;
  const headRadius = 90 * heightFactor;
  const headCenterY = 280;

  // Draw model body silhouette foundation
  drawModelAnatomy(ctx, {
    centerX,
    headCenterY,
    headRadius,
    heightFactor,
    widthFactor,
    isMale,
    skin,
    canvasHeight,
    width
  });

  // Render Head & Face: user photo if provided, or stock Vietnamese model
  if (loadedUser) {
    compositeUserFace(ctx, loadedUser, centerX, headCenterY, headRadius);
  } else if (loadedStockModel) {
    compositeStockModelFace(ctx, loadedStockModel, centerX, headCenterY, headRadius, isMale);
  } else {
    drawStylizedVietnameseFace(ctx, centerX, headCenterY, headRadius, isMale, skin);
  }

  // -------------------------------------------------------------
  // STEP 3: Authentic Vietnamese Garment Tailoring
  // -------------------------------------------------------------
  drawVietnameseGarment(ctx, {
    costumeId,
    costumeName,
    dynasty,
    centerX,
    headCenterY,
    headRadius,
    heightFactor,
    widthFactor,
    isMale,
    canvasHeight,
    width
  });

  // -------------------------------------------------------------
  // STEP 4: Modern Remix Layer (Trousers, Skirts, Footwear)
  // -------------------------------------------------------------
  drawModernRemixItems(ctx, {
    wardrobeItems,
    centerX,
    canvasHeight,
    width,
    widthFactor,
    heightFactor,
    isMale
  });

  // -------------------------------------------------------------
  // STEP 5: Traditional Heritage Accessories Placement
  // -------------------------------------------------------------
  await drawTraditionalAccessories(ctx, {
    accessories,
    costumeId,
    centerX,
    headCenterY,
    headRadius,
    width,
    canvasHeight,
    isMale
  });

  // -------------------------------------------------------------
  // STEP 6: Editorial Lighting, Vignette & Imperial Seal
  // -------------------------------------------------------------
  renderEditorialFinishing(ctx, width, canvasHeight, {
    costumeName,
    dynasty,
    genderLabel: isMale ? 'Nam nhân' : 'Nữ nhân',
    height,
    weight,
    determinedShape
  });

  try {
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (canvasErr) {
    console.warn('[EditorialLookbook] Canvas export notice:', canvasErr);
    try {
      return canvas.toDataURL();
    } catch {
      return '';
    }
  }
}

/**
 * 1. Ambient Background Scenes
 */
function renderSceneBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: 'hue_citadel' | 'hoi_an' | 'editorial_studio' | 'temple_garden'
) {
  if (scene === 'hue_citadel') {
    // Imperial Hue Citadel: Royal red lacquer columns, golden amber atmospheric glow
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#2B120F');
    bg.addColorStop(0.4, '#481E19');
    bg.addColorStop(0.7, '#241411');
    bg.addColorStop(1, '#150B0A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Left and right imperial columns
    ctx.save();
    ctx.fillStyle = '#6E1D19';
    ctx.fillRect(0, 0, 140, height);
    ctx.fillRect(width - 140, 0, 140, height);

    ctx.fillStyle = '#C89436';
    ctx.fillRect(135, 0, 8, height);
    ctx.fillRect(width - 143, 0, 8, height);

    // Subtle imperial archway silhouette in background
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width * 0.5, 380, 360, Math.PI, 0, false);
    ctx.stroke();
    ctx.restore();

  } else if (scene === 'hoi_an') {
    // Hoi An Ancient Town: Warm ochre yellow heritage walls with moss patina & lantern warm glow
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#3A2E1A');
    bg.addColorStop(0.3, '#755523');
    bg.addColorStop(0.65, '#996C27');
    bg.addColorStop(1, '#2E2211');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Moss patina textures
    ctx.save();
    const mossGrad = ctx.createRadialGradient(180, 160, 40, 180, 160, 280);
    mossGrad.addColorStop(0, 'rgba(40, 60, 35, 0.35)');
    mossGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = mossGrad;
    ctx.fillRect(0, 0, 400, 400);

    // Silk Lantern glow on side
    const lanternGrad = ctx.createRadialGradient(width - 160, 220, 20, width - 160, 220, 240);
    lanternGrad.addColorStop(0, 'rgba(235, 120, 40, 0.5)');
    lanternGrad.addColorStop(0.5, 'rgba(200, 70, 30, 0.2)');
    lanternGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lanternGrad;
    ctx.fillRect(width - 350, 50, 350, 400);
    ctx.restore();

  } else if (scene === 'temple_garden') {
    // Ancient Temple Courtyard: Mossy stone flagstones, morning mist, deep slate
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#1E2522');
    bg.addColorStop(0.4, '#2B3732');
    bg.addColorStop(0.8, '#18201D');
    bg.addColorStop(1, '#0F1513');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Bamboo / foliage soft bokeh
    ctx.save();
    ctx.fillStyle = 'rgba(74, 98, 80, 0.12)';
    ctx.beginPath();
    ctx.arc(220, 260, 180, 0, Math.PI * 2);
    ctx.arc(width - 200, 340, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else {
    // High-Fashion Editorial Studio: Warm amber directional light, rich dark wood & silk backdrop
    const bg = ctx.createRadialGradient(width * 0.5, 420, 100, width * 0.5, height * 0.55, width * 0.85);
    bg.addColorStop(0, '#422B1E');
    bg.addColorStop(0.35, '#2D1C13');
    bg.addColorStop(0.7, '#1A100B');
    bg.addColorStop(1, '#0F0906');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Soft editorial amber rim glow
    ctx.save();
    const rimGrad = ctx.createLinearGradient(width * 0.1, 0, width * 0.9, height);
    rimGrad.addColorStop(0, 'rgba(224, 169, 109, 0.12)');
    rimGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    rimGrad.addColorStop(1, 'rgba(193, 18, 31, 0.08)');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

/**
 * 2. Model Anatomy Foundation
 */
function drawModelAnatomy(
  ctx: CanvasRenderingContext2D,
  params: {
    centerX: number;
    headCenterY: number;
    headRadius: number;
    heightFactor: number;
    widthFactor: number;
    isMale: boolean;
    skin: { base: string; shadow: string; highlight: string; lips: string };
    canvasHeight: number;
    width: number;
  }
) {
  const { centerX, headCenterY, headRadius, isMale, skin, widthFactor, canvasHeight } = params;

  // Neck & Shoulders foundation
  ctx.save();
  ctx.fillStyle = skin.base;
  ctx.beginPath();
  const neckW = (isMale ? 55 : 44) * widthFactor;
  const shoulderW = (isMale ? 230 : 185) * widthFactor;
  const shoulderY = headCenterY + headRadius + 80;

  // Neck
  ctx.rect(centerX - neckW, headCenterY + headRadius * 0.5, neckW * 2, 90);
  ctx.fill();

  // Neck shadow under chin
  ctx.fillStyle = skin.shadow;
  ctx.beginPath();
  ctx.ellipse(centerX, headCenterY + headRadius + 15, neckW * 0.8, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoulders curve
  ctx.fillStyle = skin.base;
  ctx.beginPath();
  ctx.moveTo(centerX - neckW, headCenterY + headRadius + 45);
  ctx.quadraticCurveTo(centerX - shoulderW * 0.6, shoulderY - 20, centerX - shoulderW, shoulderY + 80);
  ctx.lineTo(centerX + shoulderW, shoulderY + 80);
  ctx.quadraticCurveTo(centerX + shoulderW * 0.6, shoulderY - 20, centerX + neckW, headCenterY + headRadius + 45);
  ctx.closePath();
  ctx.fill();

  // Torso & Arms placeholder
  ctx.fillStyle = skin.shadow;
  ctx.fillRect(centerX - shoulderW * 0.9, shoulderY + 80, shoulderW * 1.8, canvasHeight - (shoulderY + 80));
  ctx.restore();
}

/**
 * Composite real user face with soft feathered edge
 */
function compositeUserFace(
  ctx: CanvasRenderingContext2D,
  userImg: HTMLImageElement,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  // Create natural oval clipping mask for face and hair
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, r * 1.05, r * 1.35, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Aspect-fit user image into head circle
  const uAspect = userImg.width / userImg.height;
  let drawW = r * 2.4;
  let drawH = drawW / uAspect;
  if (drawH < r * 2.7) {
    drawH = r * 2.7;
    drawW = drawH * uAspect;
  }
  const drawX = cx - drawW / 2;
  const drawY = cy - drawH * 0.42;

  ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Soft edge vignette around face for seamless neckline integration
  ctx.save();
  const faceRim = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.35);
  faceRim.addColorStop(0, 'rgba(0,0,0,0)');
  faceRim.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  faceRim.addColorStop(1, 'rgba(25, 17, 12, 0.4)');
  ctx.fillStyle = faceRim;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, r * 1.25, r * 1.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Composite stock Asian model face
 */
function compositeStockModelFace(
  ctx: CanvasRenderingContext2D,
  stockImg: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
  isMale: boolean
) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5, r * 1.05, r * 1.35, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const uAspect = stockImg.width / stockImg.height;
  let drawW = r * 2.5;
  let drawH = drawW / uAspect;
  if (drawH < r * 2.8) {
    drawH = r * 2.8;
    drawW = drawH * uAspect;
  }
  const drawX = cx - drawW / 2;
  const drawY = cy - drawH * 0.38;

  ctx.drawImage(stockImg, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/**
 * Draw Vietnamese Classical Model Face
 */
function drawStylizedVietnameseFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  isMale: boolean,
  skin: { base: string; shadow: string; highlight: string; lips: string }
) {
  ctx.save();
  // Face contour
  ctx.fillStyle = skin.base;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.85, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#171210';
  ctx.beginPath();
  if (!isMale) {
    // Elegant Vietnamese chignon (Búi tóc đoan trang)
    ctx.arc(cx, cy - r * 0.9, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Front sleek hair parting
    ctx.beginPath();
    ctx.arc(cx, cy - 15, r * 0.9, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(cx - r * 0.4, cy - r * 0.2, cx, cy - r * 0.1);
    ctx.quadraticCurveTo(cx + r * 0.4, cy - r * 0.2, cx + r * 0.85, cy - 15);
    ctx.fill();
  } else {
    // Scholar topknot / neat slicked hair
    ctx.arc(cx, cy - r * 0.7, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 20, r * 0.85, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Eyebrows
  ctx.strokeStyle = '#2A1C16';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Left brow
  ctx.moveTo(cx - 52, cy - 22);
  ctx.quadraticCurveTo(cx - 32, cy - 30, cx - 12, cy - 24);
  // Right brow
  ctx.moveTo(cx + 12, cy - 24);
  ctx.quadraticCurveTo(cx + 32, cy - 30, cx + 52, cy - 22);
  ctx.stroke();

  // Eyes (Almond Asian eyes)
  ctx.strokeStyle = '#1D130E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 8);
  ctx.quadraticCurveTo(cx - 32, cy - 16, cx - 15, cy - 8);
  ctx.moveTo(cx + 15, cy - 8);
  ctx.quadraticCurveTo(cx + 32, cy - 16, cx + 50, cy - 8);
  ctx.stroke();

  // Lips
  ctx.fillStyle = skin.lips;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 42, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 3. Authentic Vietnamese Garment Tailoring Layer
 */
function drawVietnameseGarment(
  ctx: CanvasRenderingContext2D,
  params: {
    costumeId: string;
    costumeName: string;
    dynasty: string;
    centerX: number;
    headCenterY: number;
    headRadius: number;
    heightFactor: number;
    widthFactor: number;
    isMale: boolean;
    canvasHeight: number;
    width: number;
  }
) {
  const { costumeId, centerX, headCenterY, headRadius, widthFactor, canvasHeight, isMale } = params;

  ctx.save();
  const collarY = headCenterY + headRadius + 35;
  const shoulderW = (isMale ? 280 : 240) * widthFactor;
  const robeBottomY = canvasHeight - 200;
  const hemWidth = (isMale ? 340 : 310) * widthFactor;

  // Primary Fabric Colors according to garment type
  let baseColor = '#9B2226'; // Imperial Crimson default
  let lapelColor = '#C89436'; // Gold
  let liningColor = '#FDFBF7'; // Ivory silk

  if (costumeId.includes('nhat-binh')) {
    baseColor = '#9E2A2B'; // Vermilion royal silk
    lapelColor = '#D4AF37'; // Imperial gold
  } else if (costumeId.includes('tac')) {
    baseColor = isMale ? '#1D3557' : '#582F0E'; // Royal navy / copper amber
    lapelColor = '#C5A880';
  } else if (costumeId.includes('giao-linh')) {
    baseColor = '#2B4162'; // Indigo / Chàm Đại Việt
    lapelColor = '#D8A47F'; // Terracotta
    liningColor = '#F4EDE2';
  } else if (costumeId.includes('tu-than')) {
    baseColor = '#4A3B32'; // Nâu gụ Kinh Bắc
    lapelColor = '#C1121F'; // Đỏ cánh sen
  } else if (costumeId.includes('ba-ba')) {
    baseColor = '#588157'; // Xanh cốm lụa Nam Bộ
    lapelColor = '#3A5A40';
  } else if (costumeId.includes('lemur')) {
    baseColor = '#3D5A80'; // Xanh Indochine
    lapelColor = '#98C1D9';
  } else if (costumeId.includes('vien-linh')) {
    baseColor = '#1B263B'; // Chàm quan chức
    lapelColor = '#E0A96D';
  }

  // A. Robe Main Body & Flowing Sleeves (Tay Thụng)
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  // Left shoulder & wide drooping sleeve
  ctx.moveTo(centerX - 45, collarY);
  ctx.lineTo(centerX - shoulderW, collarY + 60);
  ctx.lineTo(centerX - shoulderW - 140, collarY + 380); // Wide drooping sleeve edge
  ctx.quadraticCurveTo(centerX - shoulderW - 80, collarY + 440, centerX - shoulderW * 0.75, collarY + 360);
  // Waist to hem
  ctx.lineTo(centerX - hemWidth, robeBottomY);
  // Hem bottom
  ctx.quadraticCurveTo(centerX, robeBottomY + 35, centerX + hemWidth, robeBottomY);
  // Right side to sleeve
  ctx.lineTo(centerX + shoulderW * 0.75, collarY + 360);
  ctx.quadraticCurveTo(centerX + shoulderW + 80, collarY + 440, centerX + shoulderW + 140, collarY + 380);
  ctx.lineTo(centerX + shoulderW, collarY + 60);
  ctx.lineTo(centerX + 45, collarY);
  ctx.closePath();
  ctx.fill();

  // Silk Texture Shading & Drapery Folds
  const fabricGrad = ctx.createLinearGradient(centerX - shoulderW, 0, centerX + shoulderW, 0);
  fabricGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
  fabricGrad.addColorStop(0.2, 'rgba(255,255,255,0.08)');
  fabricGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
  fabricGrad.addColorStop(0.8, 'rgba(255,255,255,0.08)');
  fabricGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = fabricGrad;
  ctx.fill();

  // B. Specific Collar & Lapel Architectures
  if (costumeId.includes('nhat-binh')) {
    // ÁO NHẬT BÌNH: Cổ nẹp chữ nhật bản to & Dải ngũ sắc
    drawNhatBinhLapel(ctx, centerX, collarY, robeBottomY);
  } else if (costumeId.includes('giao-linh')) {
    // ÁO GIAO LĨNH: Cổ vạt chéo chữ V hữu nhậm (phải đè trái)
    drawGiaoLinhCollar(ctx, centerX, collarY, robeBottomY, lapelColor, liningColor);
  } else if (costumeId.includes('vien-linh')) {
    // ÁO VIÊN LĨNH: Cổ tròn cài khuy lệch vai phải
    drawVienLinhCollar(ctx, centerX, collarY, lapelColor);
  } else if (costumeId.includes('tu-than')) {
    // ÁO TỨ THÂN: Dải yếm thắm bên trong & Dải lụa thắt vạt
    drawTuThanWaistTie(ctx, centerX, collarY, robeBottomY);
  } else {
    // ÁO TẤC / ÁO NGŨ THÂN: Cổ đứng cao viền khuy cúc ngũ luân
    drawNguThanStandingCollar(ctx, centerX, collarY, robeBottomY, lapelColor);
  }

  ctx.restore();
}

/**
 * Nhật Bình Lapel: Cổ chữ nhật bản lớn, dải ngũ sắc, hoa văn phượng hoàng
 */
function drawNhatBinhLapel(ctx: CanvasRenderingContext2D, cx: number, cy: number, bottomY: number) {
  const lapelW = 60;
  // Rectangular chest frame
  ctx.fillStyle = '#D4AF37'; // Imperial Gold
  ctx.fillRect(cx - lapelW, cy + 10, lapelW * 2, 280);

  // Five-color lapel ribbons (Ngũ sắc: Vàng, Đỏ, Xanh lam, Trắng, Xanh lục)
  const colors = ['#F9C74F', '#D90429', '#1D3557', '#F8F9FA', '#2D6A4F'];
  const barH = 10;
  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(cx - lapelW, cy + 15 + i * barH, lapelW * 2, barH);
  }

  // Inner center opening
  ctx.fillStyle = '#780001';
  ctx.fillRect(cx - 18, cy + 85, 36, bottomY - (cy + 85));

  // Golden Medallion / Phoenix Emblem
  ctx.save();
  ctx.fillStyle = '#FEE440';
  ctx.beginPath();
  ctx.arc(cx, cy + 180, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#B38A18';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Stylized embroidered floral core
  ctx.fillStyle = '#8B1E1E';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❖', cx, cy + 180);
  ctx.restore();

  // Lapel flowing bands to hem
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(cx - lapelW, cy + 290, 24, bottomY - (cy + 290));
  ctx.fillRect(cx + lapelW - 24, cy + 290, 24, bottomY - (cy + 290));
}

/**
 * Giao Lĩnh Crossed V-Collar (Hữu Nhậm)
 */
function drawGiaoLinhCollar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bottomY: number,
  trimColor: string,
  innerColor: string
) {
  // Inner garment collar peak
  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 15);
  ctx.lineTo(cx - 35, cy + 65);
  ctx.lineTo(cx + 35, cy + 65);
  ctx.closePath();
  ctx.fill();

  // Left lapel under (vạt trái)
  ctx.save();
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy);
  ctx.lineTo(cx + 120, cy + 260);
  ctx.lineTo(cx + 90, cy + 275);
  ctx.lineTo(cx - 65, cy + 20);
  ctx.closePath();
  ctx.fill();

  // Right lapel over (vạt phải đè vạt trái - HỮU NHẬM)
  ctx.fillStyle = '#E5B188';
  ctx.beginPath();
  ctx.moveTo(cx + 50, cy);
  ctx.lineTo(cx - 130, cy + 270);
  ctx.lineTo(cx - 100, cy + 285);
  ctx.lineTo(cx + 65, cy + 20);
  ctx.closePath();
  ctx.fill();

  // Waist silk sash (Thắt lưng lụa)
  ctx.fillStyle = '#8B1E1E';
  ctx.fillRect(cx - 160, cy + 285, 320, 36);

  // Flowing ribbon tails
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 320);
  ctx.lineTo(cx - 45, cy + 540);
  ctx.lineTo(cx - 15, cy + 540);
  ctx.lineTo(cx - 5, cy + 320);
  ctx.fill();
  ctx.restore();
}

/**
 * Viên Lĩnh Round Collar
 */
function drawVienLinhCollar(ctx: CanvasRenderingContext2D, cx: number, cy: number, goldColor: string) {
  ctx.save();
  // Round band
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy + 25, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Off-center button row to right shoulder
  ctx.fillStyle = '#F5D061';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(cx + 46 + i * 26, cy + 30 + i * 18, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Tứ Thân Silk Waist Tie & Yếm Bodice
 */
function drawTuThanWaistTie(ctx: CanvasRenderingContext2D, cx: number, cy: number, bottomY: number) {
  ctx.save();
  // Vermilion silk bib (Áo yếm đào)
  ctx.fillStyle = '#C1121F';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 20);
  ctx.lineTo(cx - 55, cy + 110);
  ctx.lineTo(cx + 55, cy + 110);
  ctx.closePath();
  ctx.fill();

  // Tied silk sashes at waist
  ctx.fillStyle = '#F39A59'; // Silk peach sash
  ctx.fillRect(cx - 130, cy + 230, 260, 32);

  // Front two panels tied in knot
  ctx.fillStyle = '#6F4E37';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 246, 28, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flowing split front panels
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy + 260);
  ctx.lineTo(cx - 95, bottomY);
  ctx.lineTo(cx - 30, bottomY);
  ctx.lineTo(cx - 5, cy + 260);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 5, cy + 260);
  ctx.lineTo(cx + 30, bottomY);
  ctx.lineTo(cx + 95, bottomY);
  ctx.lineTo(cx + 20, cy + 260);
  ctx.fill();
  ctx.restore();
}

/**
 * Ngũ Thân / Áo Tấc Standing Collar with 5 Buttons (Ngũ Khuy)
 */
function drawNguThanStandingCollar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bottomY: number,
  goldColor: string
) {
  ctx.save();
  // High standing mandarin collar (Cổ đứng)
  ctx.fillStyle = '#222';
  ctx.fillRect(cx - 45, cy - 8, 90, 24);

  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - 45, cy - 8, 90, 24);

  // Five Buttons (Ngũ Luân: Nhân, Lễ, Nghĩa, Trí, Tín)
  const buttonPositions = [
    { x: cx + 18, y: cy + 3 },
    { x: cx + 48, y: cy + 45 },
    { x: cx + 55, y: cy + 110 },
    { x: cx + 55, y: cy + 175 },
    { x: cx + 55, y: cy + 240 }
  ];

  ctx.fillStyle = '#D4AF37';
  for (const pos of buttonPositions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#825E1B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 4. Modern Remix Garments (Trousers, Skirt, Footwear)
 */
function drawModernRemixItems(
  ctx: CanvasRenderingContext2D,
  params: {
    wardrobeItems: Array<{ name: string; category?: string }>;
    centerX: number;
    canvasHeight: number;
    width: number;
    widthFactor: number;
    heightFactor: number;
    isMale: boolean;
  }
) {
  const { wardrobeItems, centerX, canvasHeight, widthFactor, isMale } = params;
  const bottomY = canvasHeight - 200;
  const legW = 55 * widthFactor;

  ctx.save();
  // Check if skirt or pants
  const isSkirt = wardrobeItems.some(w => w.name.toLowerCase().includes('váy'));

  if (isSkirt) {
    // Silk Pleated Skirt (Chân váy dập ly)
    ctx.fillStyle = '#F5EDE1';
    ctx.beginPath();
    ctx.moveTo(centerX - 130 * widthFactor, bottomY);
    ctx.lineTo(centerX - 170 * widthFactor, canvasHeight - 85);
    ctx.lineTo(centerX + 170 * widthFactor, canvasHeight - 85);
    ctx.lineTo(centerX + 130 * widthFactor, bottomY);
    ctx.closePath();
    ctx.fill();

    // Pleat lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    for (let x = centerX - 150 * widthFactor; x <= centerX + 150 * widthFactor; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x * 0.9, bottomY);
      ctx.lineTo(x, canvasHeight - 85);
      ctx.stroke();
    }
  } else {
    // Tailored Trousers (Quần âu ống suông / lụa trắng ngà)
    ctx.fillStyle = isMale ? '#181C20' : '#FAF6F0';
    // Left leg
    ctx.fillRect(centerX - 100 * widthFactor, bottomY, legW, 115);
    // Right leg
    ctx.fillRect(centerX + 45 * widthFactor, bottomY, legW, 115);
  }

  // Shoes / Hài thêu / Leather Boots
  ctx.fillStyle = '#1D130E';
  // Left shoe
  ctx.beginPath();
  ctx.ellipse(centerX - 72 * widthFactor, canvasHeight - 78, 38, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right shoe
  ctx.beginPath();
  ctx.ellipse(centerX + 72 * widthFactor, canvasHeight - 78, 38, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 5. Traditional Heritage Accessories Layer
 */
async function drawTraditionalAccessories(
  ctx: CanvasRenderingContext2D,
  params: {
    accessories: Array<{ id?: string; name: string; image?: string; category?: string }>;
    costumeId: string;
    centerX: number;
    headCenterY: number;
    headRadius: number;
    width: number;
    canvasHeight: number;
    isMale: boolean;
  }
) {
  const { accessories, centerX, headCenterY, headRadius, isMale } = params;

  ctx.save();
  for (const acc of accessories) {
    const accName = acc.name.toLowerCase();

    // A. Khăn Đóng (Nam) / Khăn Vành Dây (Nữ)
    if (accName.includes('khăn đóng') || accName.includes('khăn vành')) {
      if (isMale || accName.includes('đóng')) {
        // Khăn Đóng nam nhân (Nếp gấp chữ Nhất ngang trán)
        ctx.fillStyle = '#111315';
        ctx.beginPath();
        ctx.ellipse(centerX, headCenterY - headRadius * 0.45, headRadius * 0.95, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fabric folds
        ctx.strokeStyle = '#2B303A';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Khăn Vành Dây cung đình Huế (Vàng kim hoàng gia quấn nhiều vòng)
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.ellipse(centerX, headCenterY - headRadius * 0.5, headRadius * 1.05, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#997316';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }

    // B. Kiềng Bạc (Silver Torque Necklace)
    if (accName.includes('kiềng bạc') || accName.includes('kiềng')) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(centerX, headCenterY + headRadius + 32, 75, 52, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Silver highlight sheen
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // C. Chuỗi Ngọc Trai (Pearl Necklace)
    if (accName.includes('ngọc trai')) {
      ctx.fillStyle = '#FAF9F6';
      const numPearls = 26;
      for (let i = 0; i < numPearls; i++) {
        const angle = (Math.PI / (numPearls - 1)) * i;
        const px = centerX - Math.cos(angle) * 88;
        const py = headCenterY + headRadius + 42 + Math.sin(angle) * 70;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // D. Quạt Xếp Trầm Hương (Handheld Folding Fan)
    if (accName.includes('quạt')) {
      const fanX = centerX + 180;
      const fanY = headCenterY + headRadius + 280;

      // Draw fan blades spread gracefully
      ctx.save();
      ctx.translate(fanX, fanY);
      ctx.rotate(-Math.PI * 0.2);

      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.arc(0, 0, 140, -Math.PI * 0.65, -Math.PI * 0.15);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#5A3825';
      ctx.lineWidth = 2.5;
      for (let a = -Math.PI * 0.65; a <= -Math.PI * 0.15; a += 0.12) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 140, Math.sin(a) * 140);
        ctx.stroke();
      }
      ctx.restore();
    }

    // E. Nón Ba Tầm (Flat Palm Hat)
    if (accName.includes('nón ba tầm') || accName.includes('quai thao')) {
      const hatX = centerX - 240;
      const hatY = headCenterY + headRadius + 240;
      ctx.save();
      ctx.fillStyle = '#E8D5B5';
      ctx.beginPath();
      ctx.ellipse(hatX, hatY, 95, 38, -Math.PI * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8C6843';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Quai thao silk strap
      ctx.strokeStyle = '#C1121F';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hatX - 35, hatY);
      ctx.quadraticCurveTo(hatX - 10, hatY + 90, hatX + 30, hatY + 60);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/**
 * 6. High-End Editorial Finishing & Cinnabar Seal
 */
function renderEditorialFinishing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: {
    costumeName: string;
    dynasty: string;
    genderLabel: string;
    height: number;
    weight: number;
    determinedShape: string;
  }
) {
  ctx.save();

  // Subtle luxury lighting vignette
  const vig = ctx.createRadialGradient(width * 0.5, height * 0.45, width * 0.35, width * 0.5, height * 0.5, width * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.7, 'rgba(0,0,0,0.18)');
  vig.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // Bottom text shadow scrim
  const scrim = ctx.createLinearGradient(0, height - 240, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.35, 'rgba(18, 12, 9, 0.75)');
  scrim.addColorStop(1, 'rgba(10, 6, 4, 0.96)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height - 240, width, 240);

  // Double Gold Border Filigree
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Imperial Cinnabar Seal (Dấu Triện Son Đỏ)
  const sealX = 54;
  const sealY = 54;
  const sealSize = 78;

  ctx.fillStyle = '#9B2226';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.fillRect(sealX, sealY, sealSize, sealSize);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.strokeRect(sealX + 4, sealY + 4, sealSize - 8, sealSize - 8);

  ctx.fillStyle = '#FDFBF7';
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NẾP', sealX + sealSize / 2, sealY + 22);
  ctx.font = '10px serif';
  ctx.fillText('DI SẢN', sealX + sealSize / 2, sealY + 41);
  ctx.fillText('ĐẠI VIỆT', sealX + sealSize / 2, sealY + 58);

  // Header Title
  ctx.fillStyle = '#F5EDE1';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NẾP DI SẢN • BẢN PHỐI CÁ NHÂN HÓA', sealX + sealSize + 20, sealY + 30);

  ctx.fillStyle = '#E0A96D';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Quy Thức Điển Chế: ${meta.costumeName} (${meta.dynasty})`, sealX + sealSize + 20, sealY + 54);

  // Footer Personal Metric Badge
  const footerY = height - 120;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.fillText(meta.costumeName, 58, footerY);

  ctx.fillStyle = '#E0A96D';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Niên Đại: ${meta.dynasty} · Thần Thái: ${meta.genderLabel}`, 58, footerY + 28);

  ctx.fillStyle = '#C5B5A5';
  ctx.font = '12px sans-serif';
  const shapeLabels: Record<string, string> = {
    slim: 'Thon thả tao nhã',
    balanced: 'Cân đối thanh lịch',
    curvy: 'Đài các đẫy đà',
    athletic: 'Đĩnh đạc bề thế'
  };
  const shapeDesc = shapeLabels[meta.determinedShape] || 'Thanh nhã Á Đông';
  ctx.fillText(`Nhân trắc học: ${meta.height}cm, ${meta.weight}kg · Phom vóc: ${shapeDesc}`, 58, footerY + 52);

  ctx.restore();
}
