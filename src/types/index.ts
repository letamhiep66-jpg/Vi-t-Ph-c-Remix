export type Gender = 'male' | 'female' | 'unisex';

export interface FriendProfile {
  id: string;
  name: string;
  relationship: string; // 'Bạn bè' | 'Mẹ' | 'Bố' | 'Vợ / Chồng' | 'Anh / Chị' | 'Em' | 'Đồng nghiệp' | 'Khác'
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: Gender;
  avatar?: string;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: Gender;
  avatar: string; // url or data url
  favoriteEra?: string;
  favoriteEras?: string[]; // Multi-select support
  purpose?: string;
  purposes?: string[]; // Multi-select support
  isOnboarded?: boolean;
  friendProfiles?: FriendProfile[];
}

export type CulturalStatus = 'green' | 'yellow' | 'red';

export interface CulturalFactor {
  status: CulturalStatus;
  title: string;
  note: string;
  suggestion?: string;
}

export interface CulturalCheck {
  overallStatus: CulturalStatus;
  score: number; // 0 - 100
  silhouette: CulturalFactor;
  accessories: CulturalFactor;
  occasionColor: CulturalFactor;
  summary: string;
}

export type LayerType = 
  | 'background'
  | 'base_avatar'
  | 'bottom'
  | 'inner_top'
  | 'outer_top'
  | 'accessory_back'
  | 'shoes'
  | 'accessory_front';

export interface TraditionalCostume {
  id: string;
  name: string;
  dynasty: string;
  era: string;
  shortDesc: string;
  historyStory: string;
  identificationFeatures: string[];
  suitableOccasions: string[];
  gender: Gender;
  genderSupport?: 'both' | 'male' | 'female';
  frontImage: string;
  backImage: string;
  maleFrontImage?: string;
  femaleFrontImage?: string;
  pngOverlayImage?: string; // Transparent PNG for 2D avatar dress up
  layerType?: LayerType;
  sideImage?: string;
  topImage?: string;
  maleTopImage?: string;
  femaleTopImage?: string;
  maleTopDesc?: string;
  femaleTopDesc?: string;
  dominantColors: string[];
  culturalNotes: string;
  silhouetteType: 'loose' | 'fitted' | 'layered';
  region?: 'Bắc Bộ' | 'Trung Bộ' | 'Nam Bộ' | 'Toàn quốc';
  structureComponents?: string[];
  wearingEtiquette?: string;
  modernRemixTips?: string;
}

export interface ModernGarment {
  id: string;
  name: string;
  category: 'jacket' | 'pants' | 'skirt' | 'shoes';
  colorName: string;
  hexColor: string;
  image: string;
  pngOverlayImage?: string;
  layerType: LayerType;
  styleDesc: string;
}

export interface AccessoryItem {
  id: string;
  name: string;
  category: 'hat' | 'bag' | 'jewelry' | 'fan' | 'eyewear' | 'other';
  image: string;
  pngOverlayImage?: string;
  layerType: LayerType;
  traditional: boolean;
  desc: string;
}

export interface UserWardrobeItem {
  id: string;
  name: string;
  category: 'bag' | 'pants' | 'jacket' | 'shirt' | 'shoes' | 'jewelry' | 'accessory' | 'other';
  layerType?: LayerType;
  frontImage?: string;
  backImage?: string;
  sideImage?: string;
  addedAt: number;
}

export interface ColorItem {
  id: string;
  name: string;
  hex: string;
  type: 'traditional' | 'modern';
  meaning: string;
  element?: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
}

export interface MixOption {
  id: string;
  name: string;
  event: string;
  costume: TraditionalCostume;
  modernGarment: ModernGarment;
  accessories: AccessoryItem[];
  colorPalette: ColorItem[];
  harmonyScore: number;
  recommendationReason: string;
  frontImage: string;
  backImage: string;
  culturalCheck: CulturalCheck;
}

export interface EquippedLayers {
  background?: string;
  baseGender: 'male' | 'female';
  bottom?: ModernGarment | UserWardrobeItem | null;
  innerTop?: ModernGarment | TraditionalCostume | UserWardrobeItem | null;
  outerTop?: TraditionalCostume | ModernGarment | UserWardrobeItem | null;
  accessoryBack?: AccessoryItem | null;
  shoes?: ModernGarment | AccessoryItem | UserWardrobeItem | null;
  accessoryFront?: AccessoryItem | UserWardrobeItem | null;
  extraLayers?: Array<{
    id: string;
    name: string;
    layerType: LayerType;
    image: string;
  }>;
}

export interface OutfitState {
  baseGender: 'male' | 'female';
  outer: TraditionalCostume | ModernGarment | UserWardrobeItem | null;
  inner: TraditionalCostume | ModernGarment | UserWardrobeItem | null;
  bottom: ModernGarment | UserWardrobeItem | null;
  shoes: ModernGarment | UserWardrobeItem | null;
  accessoryBack: AccessoryItem | null;
  accessoryFront: AccessoryItem | null;
  traditionalColor: ColorItem;
  modernColor: ColorItem;
}

export type OutfitAction =
  | { type: 'EQUIP'; item: TraditionalCostume | ModernGarment | AccessoryItem | UserWardrobeItem; slot?: 'outer' | 'inner' | 'bottom' | 'shoes' | 'accessoryFront' | 'accessoryBack' }
  | { type: 'UNEQUIP'; slot: 'outer' | 'inner' | 'bottom' | 'shoes' | 'accessoryFront' | 'accessoryBack' | 'accessory' }
  | { type: 'SET_COLOR'; target: 'traditional' | 'modern'; color: ColorItem }
  | { type: 'SET_GENDER'; gender: 'male' | 'female' }
  | { type: 'RESET'; defaultGender?: 'male' | 'female' }
  | { type: 'LOAD_OUTFIT'; payload: Partial<OutfitState> };

export interface CanvasLayerState {
  traditional: TraditionalCostume;
  modern: ModernGarment | UserWardrobeItem | null;
  accessory: AccessoryItem | UserWardrobeItem | null;
  traditionalColor: ColorItem;
  modernColor: ColorItem;
  equippedLayers?: EquippedLayers;
}

export type ErrorType = 'quota' | 'network' | 'limit' | null;

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  retryTime?: string;
}

export type ActiveTab = 'explore' | 'mix' | 'critique' | 'settings' | 'history';

export interface SavedLookbookItem {
  id: string;
  title: string;
  createdAt: string;
  compositeImage: string;
  costumeName: string;
  costumeEra: string;
  costumeId?: string;
  modernGarmentName: string;
  modernGarmentCategory: string;
  modernGarmentId?: string;
  accessoryNames: string[];
  traditionalColorName: string;
  modernColorName: string;
  occasion?: string;
  harmonyScore?: number;
  notes?: string;
  canvasState?: CanvasLayerState;
  recipientProfile?: {
    name: string;
    relationship?: string;
    height: number;
    weight: number;
    age?: number;
    gender?: Gender;
    recommendedSize?: string;
  };
}
