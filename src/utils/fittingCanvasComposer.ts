import { HeritageColorOption } from '../components/mix/UnifiedFittingFlow';
import { renderEditorialLookbook, EditorialSynthesisConfig } from './editorialSynthesisEngine';

export interface ComposeFittingOptions {
  userPhoto?: string | null;
  costumeImage?: string;
  costumeId?: string;
  costumeName: string;
  dynasty?: string;
  gender?: 'female' | 'male' | 'unisex';
  height?: number;
  weight?: number;
  skinTone?: 'fair' | 'natural' | 'warm_tan';
  bodyShape?: 'slim' | 'balanced' | 'curvy' | 'athletic';
  heritageColors?: HeritageColorOption[];
  accessories?: Array<{ id?: string; name: string; image?: string; category?: string }>;
  wardrobeItems?: Array<{ id?: string; name: string; category?: string }>;
  sceneBackground?: 'hue_citadel' | 'hoi_an' | 'editorial_studio' | 'temple_garden';
  cameraPose?: 'full_body' | 'three_quarter' | 'portrait';
  patterns?: Array<{ id?: string; name: string; icon?: string }>;
  patternDescription?: string;
  stylingPrompt?: string;
  isRefinement?: boolean;
}

/**
 * Composites a high-resolution 3:4 editorial portrait visual for Vietnamese traditional costume fitting.
 * Generates an authentic portrait of the person with their specified body silhouette, skin tone,
 * selected Vietnamese costume, historical accessories, modern wardrobe remix, and ambient setting.
 */
export async function composeEditorialFittingImage(options: ComposeFittingOptions): Promise<string> {
  const synthesisConfig: EditorialSynthesisConfig = {
    userPhoto: options.userPhoto,
    gender: options.gender || 'female',
    height: options.height || 165,
    weight: options.weight || 52,
    skinTone: options.skinTone || 'natural',
    bodyShape: options.bodyShape,
    costumeId: options.costumeId || (options.costumeName.toLowerCase().includes('nhật bình') ? 'ao-nhat-binh' : options.costumeName.toLowerCase().includes('tấc') ? 'ao-tac' : options.costumeName.toLowerCase().includes('giao lĩnh') ? 'ao-giao-linh' : options.costumeName.toLowerCase().includes('viên lĩnh') ? 'ao-vien-linh' : options.costumeName.toLowerCase().includes('tứ thân') ? 'ao-tu-than' : 'ao-ngu-than'),
    costumeName: options.costumeName,
    dynasty: options.dynasty || 'Triều Nguyễn',
    costumeImage: options.costumeImage,
    accessories: options.accessories,
    wardrobeItems: options.wardrobeItems,
    sceneBackground: options.sceneBackground || 'editorial_studio',
    cameraPose: options.cameraPose || 'three_quarter',
    patterns: options.patterns,
    patternDescription: options.patternDescription,
    stylingPrompt: options.stylingPrompt
  };

  try {
    const rendered = await renderEditorialLookbook(synthesisConfig);
    if (rendered && rendered.startsWith('data:image/')) return rendered;
  } catch (err) {
    console.warn('[CanvasComposer] Primary synthesis note:', err);
  }

  // Safe retry: kết xuất không dùng ảnh ngoài để đảm bảo canvas 100% không bị taint
  try {
    const safeRendered = await renderEditorialLookbook({
      ...synthesisConfig,
      userPhoto: undefined
    });
    if (safeRendered && safeRendered.startsWith('data:image/')) return safeRendered;
  } catch (err2) {
    console.warn('[CanvasComposer] Safe synthesis retry note:', err2);
  }

  // Fallback to costume image or user photo if canvas fails
  return options.costumeImage || options.userPhoto || '';
}
