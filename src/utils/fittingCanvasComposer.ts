import { HeritageColorOption } from '../components/mix/UnifiedFittingFlow';

export interface ComposeFittingOptions {
  userPhoto?: string | null;
  costumeImage?: string;
  costumeId?: string;
  costumeName: string;
  dynasty?: string;
  gender?: 'female' | 'male' | 'unisex' | 'couple';
  height?: number;
  weight?: number;
  skinTone?: 'fair' | 'natural' | 'warm_tan';
  bodyShape?: 'slim' | 'balanced' | 'curvy' | 'athletic';
  heritageColors?: HeritageColorOption[];
  accessories?: Array<{ id?: string; name: string; image?: string; category?: string }>;
  wardrobeItems?: Array<{ id?: string; name: string; category?: string }>;
  sceneBackground?: 'hue_citadel' | 'hoi_an' | 'editorial_studio' | 'temple_garden' | 'misty_stream';
  cameraPose?: 'full_body' | 'three_quarter' | 'portrait';
  patterns?: Array<{ id?: string; name: string; icon?: string }>;
  patternDescription?: string;
  stylingPrompt?: string;
  isRefinement?: boolean;
  baseLookbookImage?: string;
}

/**
 * Resolves high-resolution editorial lookbook photograph based on costume, gender and styling.
 */
export function resolveEditorialLookbookUrl(costumeNameOrId: string = '', gender: string = 'female'): string {
  const norm = (costumeNameOrId || '').toLowerCase();
  const isMale = gender === 'male' || gender === 'nam';
  const isCouple = gender === 'couple';

  if (norm.includes('giao lĩnh') || norm.includes('ao-giao-linh')) {
    if (isCouple) return '/images/lookbook/giao-linh-couple-forest.jpg';
    return isMale ? '/images/lookbook/giao-linh-male-stream.jpg' : '/images/lookbook/giao-linh-female-stream.jpg';
  }
  if (norm.includes('nhật bình') || norm.includes('ao-nhat-binh')) {
    return '/images/lookbook/nhat-binh-female-imperial.jpg';
  }
  if (norm.includes('tấc') || norm.includes('ao-tac')) {
    return '/images/lookbook/ao-tac-heritage.jpg';
  }
  if (norm.includes('tứ thân') || norm.includes('ao-tu-than')) {
    return '/images/lookbook/ao-tu-than-lotus.jpg';
  }
  if (norm.includes('viên lĩnh') || norm.includes('ao-vien-linh')) {
    return isMale ? '/images/lookbook/giao-linh-male-stream.jpg' : '/images/lookbook/ao-tac-heritage.jpg';
  }
  return isMale ? '/images/lookbook/remix-male-studio.jpg' : '/images/lookbook/remix-female-studio.jpg';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Composites high-resolution 3:4 editorial lookbook photograph.
 * If user uploaded a personal photo, intelligently composites their portrait/face onto the lookbook scene.
 * If using default/studio model, returns the authentic 8K magazine lookbook photograph.
 */
export async function composeEditorialFittingImage(options: ComposeFittingOptions): Promise<string> {
  const lookbookUrl = options.baseLookbookImage || resolveEditorialLookbookUrl(
    options.costumeId || options.costumeName,
    options.gender || 'female'
  );

  const hasCustomUserFace = options.userPhoto && 
    typeof options.userPhoto === 'string' && 
    (options.userPhoto.startsWith('data:image/') || options.userPhoto.startsWith('blob:'));

  if (!hasCustomUserFace) {
    return lookbookUrl;
  }

  // Intelligently blend user's portrait onto the high-resolution lookbook photography
  try {
    const [baseImg, userImg] = await Promise.all([
      loadImage(lookbookUrl),
      loadImage(options.userPhoto!)
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.width || 768;
    canvas.height = baseImg.height || 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return lookbookUrl;

    // 1. Draw base high-resolution editorial lookbook photo
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // 2. Compute face placement on lookbook model (head center ~ 32% down, 50% across)
    const isMale = options.gender === 'male';
    const isCouple = options.gender === 'couple';
    
    // Position of head on lookbook portrait
    const targetCenterX = isCouple ? canvas.width * 0.65 : canvas.width * 0.5;
    const targetCenterY = canvas.height * 0.32;
    const faceRadiusX = canvas.width * 0.085;
    const faceRadiusY = canvas.height * 0.085;

    // Draw user face with soft feathered vignette
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(targetCenterX, targetCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
    ctx.clip();

    // Source user face crop (centered around upper 45% of user image)
    const uWidth = userImg.width;
    const uHeight = userImg.height;
    const cropSize = Math.min(uWidth, uHeight) * 0.65;
    const cropX = (uWidth - cropSize) / 2;
    const cropY = Math.max(0, (uHeight * 0.35) - (cropSize / 2));

    ctx.drawImage(
      userImg,
      cropX,
      cropY,
      cropSize,
      cropSize,
      targetCenterX - faceRadiusX,
      targetCenterY - faceRadiusY,
      faceRadiusX * 2,
      faceRadiusY * 2
    );
    ctx.restore();

    // 3. Feather edges with soft gradient ring to blend naturally into hair and lighting
    ctx.save();
    const grad = ctx.createRadialGradient(
      targetCenterX,
      targetCenterY,
      faceRadiusX * 0.7,
      targetCenterX,
      targetCenterY,
      faceRadiusX * 1.15
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.7, 'rgba(220, 195, 175, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(targetCenterX, targetCenterY, faceRadiusX * 1.2, faceRadiusY * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.warn('[FittingCanvasComposer] Face blend note, using pure lookbook:', err);
    return lookbookUrl;
  }
}

