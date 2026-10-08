import { 
  TraditionalCostume, 
  ModernGarment, 
  AccessoryItem, 
  ColorItem, 
  MixOption, 
  UserProfile 
} from '../types';
import { OFFICIAL_TRADITIONAL_COSTUMES } from '../data/costumesData';
import { getCostumeById, normalizeCostumeId } from '../utils/costumeLookup';
import { evaluateOutfitMix } from '../utils/culturalRuleChecker';

// Danh sách 10 trang phục chuẩn mực chính thức
export const TRADITIONAL_COSTUMES: TraditionalCostume[] = OFFICIAL_TRADITIONAL_COSTUMES;

export const MODERN_GARMENTS: ModernGarment[] = [
  {
    id: 'mod-blazer-oversize',
    name: 'Blazer Phom Rộng Cắt Tối Giản',
    category: 'jacket',
    layerType: 'outer_top',
    colorName: 'Xám Ghi Tro',
    hexColor: '#6C757D',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Đường cắt may sắc sảo của phong cách tailoring đương đại, tạo cấu trúc cân bằng với tà áo buông mềm mại.'
  },
  {
    id: 'mod-wide-pants',
    name: 'Quần Âu Ống Suông Culottes',
    category: 'pants',
    layerType: 'bottom',
    colorName: 'Beige Kem Lụa',
    hexColor: '#E9ECEF',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Ống suông bay bổng mô phỏng chuyển động của tà quần lụa xưa nhưng tiện lợi khi di chuyển.'
  },
  {
    id: 'mod-pleated-skirt',
    name: 'Chân Váy Xếp Ly Dáng Dài',
    category: 'skirt',
    layerType: 'bottom',
    colorName: 'Đen Mực Tàu',
    hexColor: '#212529',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Những đường nếp gấp kỷ hà tinh tế, ăn khớp với triết lý đối xứng của trang phục cổ triều.'
  },
  {
    id: 'mod-chelsea-boots',
    name: 'Chelsea Boots Da Mờ Tối Giản',
    category: 'shoes',
    layerType: 'shoes',
    colorName: 'Nâu Vỏ Cây Hạt Dẻ',
    hexColor: '#493628',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Đôi boot da vững chãi thay thế cho hài thêu, tạo diện mạo thành thị (urban) cá tính.'
  },
  {
    id: 'mod-leather-derby',
    name: 'Giày Tây Derby Da Bóng Cổ Điển',
    category: 'shoes',
    layerType: 'shoes',
    colorName: 'Đen Tuyển Quý Phái',
    hexColor: '#1A1A1A',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Đế da mộc trang nhã, biểu trưng cho sự chững chạc, đĩnh đạc khi dự đại lễ.'
  },
  {
    id: 'mod-silk-pants-white',
    name: 'Quần Lụa Bạch Ngà Ống Rộng',
    category: 'pants',
    layerType: 'bottom',
    colorName: 'Bạch Ngà Mộc',
    hexColor: '#F8F9FA',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80',
    styleDesc: 'Chất lụa Bảo Lộc mềm rủ mộc mạc, tạo chuyển động thướt tha khi sải bước.'
  }
];

export const ACCESSORY_ITEMS: AccessoryItem[] = [
  {
    id: 'acc-khan-dong',
    name: 'Khăn Đóng Quấn Nếp Chữ Nhân',
    category: 'hat',
    layerType: 'accessory_back',
    traditional: true,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    desc: 'Biểu trưng của sự tề chỉnh, nho nhã theo văn hóa Nho gia Việt Nam.'
  },
  {
    id: 'acc-tui-gam',
    name: 'Túi Gấm Thêu Hoa Sen Cầm Tay',
    category: 'bag',
    layerType: 'accessory_front',
    traditional: true,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    desc: 'Chất gấm dệt thủ công sắc sảo, tiện dụng trong các sự kiện hiện đại.'
  },
  {
    id: 'acc-kinh-ram-retro',
    name: 'Kính Râm Gọng Đồi Mồi Retro',
    category: 'eyewear',
    layerType: 'accessory_front',
    traditional: false,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    desc: 'Điểm nhấn giao thoa phong cách Đông Dương (Indochine) thập niên 1930.'
  },
  {
    id: 'acc-chuoi-ngoc-trai',
    name: 'Dải Ngọc Trai',
    category: 'jewelry',
    layerType: 'accessory_front',
    traditional: false,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    desc: 'Điểm xuyết trên nền áo lụa tối giản, gợi nét thanh tao quý phái.'
  },
  {
    id: 'acc-quat-tram',
    name: 'Quạt Xếp Trầm Hương Chạm Rồng',
    category: 'fan',
    layerType: 'accessory_front',
    traditional: true,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    pngOverlayImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    desc: 'Tỏa hương thơm dịu nhẹ, tạo phong thái khoan thai khi dạo phố.'
  }
];

export const TRADITIONAL_COLORS: ColorItem[] = [
  { id: 'col-do-dieu', name: 'Đỏ Điều Son', hex: '#9B2226', type: 'traditional', meaning: 'Hỷ sự, quyền quý, hưng thịnh', element: 'Hỏa' },
  { id: 'col-xanh-cham', name: 'Xanh Chàm Lam Điền', hex: '#1D3557', type: 'traditional', meaning: 'Điềm tĩnh, uyên bác, trường tồn', element: 'Thủy' },
  { id: 'col-vang-hoang', name: 'Vàng Hoàng Yến', hex: '#E9C46A', type: 'traditional', meaning: 'Vương giả, rực rỡ, viên mãn', element: 'Thổ' },
  { id: 'col-luc-thuy', name: 'Xanh Lục Thúy', hex: '#2A9D8F', type: 'traditional', meaning: 'Sinh sôi, thanh tân, may mắn', element: 'Mộc' },
  { id: 'col-bach-ngoc', name: 'Bạch Ngà Thuần Khiết', hex: '#FDFBF7', type: 'traditional', meaning: 'Thanh bạch, đoan trang, thuần khiết', element: 'Kim' }
];

export const MODERN_COLORS: ColorItem[] = [
  { id: 'col-xam-ghi', name: 'Xám Ghi Tro', hex: '#6C757D', type: 'modern', meaning: 'Tối giản, hiện đại', element: 'Kim' },
  { id: 'col-den-tuyen', name: 'Đen Mực Tàu', hex: '#212529', type: 'modern', meaning: 'Bí ẩn, chiều sâu', element: 'Thủy' },
  { id: 'col-beige-kem', name: 'Beige Kem Lụa', hex: '#E9ECEF', type: 'modern', meaning: 'Ấm áp, nhã nhặn', element: 'Thổ' },
  { id: 'col-nau-dat', name: 'Nâu Đất Mộc', hex: '#493628', type: 'modern', meaning: 'Chắc chắn, vững chãi', element: 'Thổ' },
  { id: 'col-cam-dat', name: 'Cam Đất Terracotta', hex: '#E76F51', type: 'modern', meaning: 'Trẻ trung, năng động', element: 'Hỏa' }
];

export type WeatherCondition = 'nong' | 'mat' | 'lanh' | 'mua';

interface CostumeProfileMetadata {
  id: string;
  tags: string[];
  formalityScore: number; // 1 (casual) -> 5 (most formal grand ceremony)
  warmthLevel: number;    // 1 (very airy) -> 5 (heavy layered warmth)
  rainSuitability: number;// 1 (cumbersome in rain) -> 5 (neat and compact)
  primaryColor: ColorItem;
  matchingModern: ModernGarment;
  matchingShoes: ModernGarment;
  matchingAccessories: AccessoryItem[];
  matchingModernColor: ColorItem;
}

const COSTUME_PROFILES: Record<string, CostumeProfileMetadata> = {
  'ao-giao-linh': {
    id: 'ao-giao-linh',
    tags: ['le_hoi', 'tot_nghiep', 'trien_lam', 'dao_pho', 'trang_trong', 'ngoai_canh', 'mat', 'nong'],
    formalityScore: 4,
    warmthLevel: 3,
    rainSuitability: 3,
    primaryColor: TRADITIONAL_COLORS[1], // Xanh chàm
    matchingModern: MODERN_GARMENTS[1], // Culottes
    matchingShoes: MODERN_GARMENTS[3], // Chelsea boots
    matchingAccessories: [ACCESSORY_ITEMS[3], ACCESSORY_ITEMS[4]], // Chuỗi ngọc + quạt
    matchingModernColor: MODERN_COLORS[2] // Beige kem
  },
  'ao-vien-linh': {
    id: 'ao-vien-linh',
    tags: ['tot_nghiep', 'trang_trong', 'le_hoi', 'trien_lam', 'ngoai_giao', 'hoc_thuat', 'mat', 'lanh'],
    formalityScore: 5,
    warmthLevel: 4,
    rainSuitability: 3,
    primaryColor: TRADITIONAL_COLORS[1], // Xanh chàm
    matchingModern: MODERN_GARMENTS[1], // Quần âu culottes
    matchingShoes: MODERN_GARMENTS[4], // Derby da
    matchingAccessories: [ACCESSORY_ITEMS[0]], // Khăn đóng
    matchingModernColor: MODERN_COLORS[1] // Đen mực tàu
  },
  'ao-doi-kham': {
    id: 'ao-doi-kham',
    tags: ['trien_lam', 'dao_pho', 'tiec_toi', 'thuong_ngay', 'thoi_trang', 'mat', 'nong', 'lanh'],
    formalityScore: 3,
    warmthLevel: 2,
    rainSuitability: 3,
    primaryColor: TRADITIONAL_COLORS[2], // Vàng hoàng yến
    matchingModern: MODERN_GARMENTS[2], // Chân váy xếp ly
    matchingShoes: MODERN_GARMENTS[3], // Chelsea boots
    matchingAccessories: [ACCESSORY_ITEMS[1], ACCESSORY_ITEMS[4]], // Túi gấm + quạt
    matchingModernColor: MODERN_COLORS[1] // Đen mực tàu
  },
  'ao-tu-than': {
    id: 'ao-tu-than',
    tags: ['le_hoi', 'thuong_ngay', 'dao_pho', 'dong_que', 'mua_xuan', 'mat', 'nong'],
    formalityScore: 3,
    warmthLevel: 3,
    rainSuitability: 3,
    primaryColor: TRADITIONAL_COLORS[0], // Đỏ điều son
    matchingModern: MODERN_GARMENTS[2], // Chân váy xếp ly
    matchingShoes: MODERN_GARMENTS[3], // Chelsea boots
    matchingAccessories: [ACCESSORY_ITEMS[1]], // Túi gấm
    matchingModernColor: MODERN_COLORS[4] // Cam đất
  },
  'ao-yem': {
    id: 'ao-yem',
    tags: ['dao_pho', 'mua_he', 'nong', 'thuong_ngay', 'trien_lam', 'nghe_thuat', 'runway'],
    formalityScore: 2,
    warmthLevel: 1,
    rainSuitability: 4,
    primaryColor: TRADITIONAL_COLORS[0], // Đỏ điều
    matchingModern: MODERN_GARMENTS[0], // Blazer khoác ngoài
    matchingShoes: MODERN_GARMENTS[3], // Chelsea boots
    matchingAccessories: [ACCESSORY_ITEMS[3]], // Chuỗi ngọc trai
    matchingModernColor: MODERN_COLORS[0] // Xám ghi
  },
  'ao-ngu-than': {
    id: 'ao-ngu-than',
    tags: ['trang_trong', 'dam_cuoi', 'tot_nghiep', 'ngoai_giao', 'le_hoi', 'mat', 'lanh', 'mua'],
    formalityScore: 4,
    warmthLevel: 3,
    rainSuitability: 4, // Tay chẽn gọn gàng, rất tốt khi trời mưa
    primaryColor: TRADITIONAL_COLORS[1], // Xanh chàm
    matchingModern: MODERN_GARMENTS[1], // Quần âu
    matchingShoes: MODERN_GARMENTS[4], // Giày Derby
    matchingAccessories: [ACCESSORY_ITEMS[0], ACCESSORY_ITEMS[2]], // Khăn đóng + kính retro
    matchingModernColor: MODERN_COLORS[1] // Đen mực tàu
  },
  'ao-tac-ngu-than-tay-thung': {
    id: 'ao-tac-ngu-than-tay-thung',
    tags: ['dam_cuoi', 'trang_trong', 'dai_le', 'le_hoi', 'ngoai_giao', 'cung_dinh', 'mat', 'lanh'],
    formalityScore: 5,
    warmthLevel: 4,
    rainSuitability: 2,
    primaryColor: TRADITIONAL_COLORS[0], // Đỏ điều son
    matchingModern: MODERN_GARMENTS[5], // Quần lụa bạch ngà
    matchingShoes: MODERN_GARMENTS[4], // Giày tây Derby
    matchingAccessories: [ACCESSORY_ITEMS[0], ACCESSORY_ITEMS[3]], // Khăn đóng + ngọc trai
    matchingModernColor: MODERN_COLORS[2] // Beige kem
  },
  'ao-nhat-binh': {
    id: 'ao-nhat-binh',
    tags: ['dam_cuoi', 'trang_trong', 'dai_le', 'le_hoi', 'trien_lam', 'hoang_gia', 'mat', 'lanh'],
    formalityScore: 5,
    warmthLevel: 4,
    rainSuitability: 2,
    primaryColor: TRADITIONAL_COLORS[0], // Đỏ son
    matchingModern: MODERN_GARMENTS[5], // Quần lụa trắng
    matchingShoes: MODERN_GARMENTS[4], // Giày Derby da
    matchingAccessories: [ACCESSORY_ITEMS[3]], // Chuỗi ngọc trai
    matchingModernColor: MODERN_COLORS[2] // Beige kem
  },
  'ao-ba-ba': {
    id: 'ao-ba-ba',
    tags: ['dao_pho', 'thuong_ngay', 'song_nuoc', 'mua_he', 'nong', 'mua', 'don_gian'],
    formalityScore: 2,
    warmthLevel: 1,
    rainSuitability: 5, // Vạt ngắn xẻ hông, rất thoát nước và tiện di chuyển trong mưa
    primaryColor: TRADITIONAL_COLORS[3], // Xanh lục thúy
    matchingModern: MODERN_GARMENTS[1], // Quần âu suông
    matchingShoes: MODERN_GARMENTS[3], // Chelsea boots
    matchingAccessories: [ACCESSORY_ITEMS[4]], // Quạt trầm
    matchingModernColor: MODERN_COLORS[1] // Đen mực tàu
  },
  'ao-dai-lemur': {
    id: 'ao-dai-lemur',
    tags: ['trien_lam', 'dam_cuoi', 'tiec_toi', 'dao_pho', 'tot_nghiep', 'co_dien', 'mat', 'lanh'],
    formalityScore: 4,
    warmthLevel: 3,
    rainSuitability: 3,
    primaryColor: TRADITIONAL_COLORS[4], // Bạch ngà
    matchingModern: MODERN_GARMENTS[2], // Chân váy / quần lụa
    matchingShoes: MODERN_GARMENTS[4], // Giày da
    matchingAccessories: [ACCESSORY_ITEMS[2], ACCESSORY_ITEMS[1]], // Kính retro + túi gấm
    matchingModernColor: MODERN_COLORS[1] // Đen
  }
};

/**
 * Filter costumes by search query and gender
 */
export async function getCostumes(
  query: string = '',
  gender: 'all' | 'male' | 'female' | 'unisex' = 'all'
): Promise<TraditionalCostume[]> {
  let list = [...TRADITIONAL_COSTUMES];

  if (gender !== 'all') {
    if (gender === 'female') {
      // Các trang phục Nữ giới mặc được: Thuần Nữ + Trang phục cả Nam & Nữ đều mặc được
      list = list.filter((c) => c.gender === 'female' || c.gender === 'unisex' || c.genderSupport === 'both');
    } else if (gender === 'male') {
      // Các trang phục Nam giới mặc được: Thuần Nam + Trang phục cả Nam & Nữ đều mặc được
      list = list.filter(
        (c) => c.gender === 'male' || c.gender === 'unisex' || c.genderSupport === 'both' || c.genderSupport === 'male'
      );
    } else if (gender === 'unisex') {
      list = list.filter((c) => c.gender === 'unisex' || c.genderSupport === 'both');
    }
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dynasty.toLowerCase().includes(q) ||
        c.era.toLowerCase().includes(q) ||
        (c.shortDesc && c.shortDesc.toLowerCase().includes(q)) ||
        (c.historyStory && c.historyStory.toLowerCase().includes(q)) ||
        (c.suitableOccasions && c.suitableOccasions.some((o) => o.toLowerCase().includes(q))) ||
        (c.identificationFeatures && c.identificationFeatures.some((f) => f.toLowerCase().includes(q)))
    );
  }

  return list;
}

/**
 * Service API: Event-based outfit recommendation engine
 * Tự động tính điểm hài hòa (harmonyScore) và sinh 3 phương án KHÁC NHAU từ 10 trang phục.
 */
export async function recommendOutfitsForEvent(
  eventDescription: string,
  userProfile?: UserProfile,
  weather: WeatherCondition = 'mat',
  regionPreference?: string
): Promise<MixOption[]> {
  // Simulate brief calculation latency
  await new Promise((resolve) => setTimeout(resolve, 180));

  const query = (eventDescription || '').toLowerCase();
  const gender = userProfile?.gender || 'female';

  // 1. Chấm điểm từng trang phục trong 10 mẫu
  const scoredCostumes: Array<{ costume: TraditionalCostume; score: number; matchReasons: string[] }> = [];

  for (const costume of OFFICIAL_TRADITIONAL_COSTUMES) {
    const meta = COSTUME_PROFILES[costume.id] || {
      id: costume.id,
      tags: ['le_hoi'],
      formalityScore: 3,
      warmthLevel: 3,
      rainSuitability: 3,
      primaryColor: TRADITIONAL_COLORS[0],
      matchingModern: MODERN_GARMENTS[1],
      matchingShoes: MODERN_GARMENTS[3],
      matchingAccessories: [ACCESSORY_ITEMS[1]],
      matchingModernColor: MODERN_COLORS[0]
    };

    let score = 50;
    const matchReasons: string[] = [];

    // Lọc theo giới tính nghiêm ngặt
    if (costume.gender === 'female' && gender === 'male') {
      continue; // Áo thuần nữ không gợi ý cho nam
    }
    if (costume.gender === 'male' && gender === 'female') {
      continue; // Áo thuần nam không gợi ý cho nữ
    }

    // Từ khóa sự kiện: Đám cưới
    if (query.includes('cưới') || query.includes('hôn') || query.includes('wedding')) {
      if (['ao-tac-ngu-than-tay-thung', 'ao-nhat-binh', 'ao-ngu-than'].includes(costume.id)) {
        score += 35;
        matchReasons.push('Đại lễ phục cung đình trang trọng bậc nhất cho ngày cưới');
      } else if (costume.id === 'ao-dai-lemur') {
        score += 25;
        matchReasons.push('Vẻ đẹp kiều diễm đài các giao thời');
      } else {
        score += 5;
      }
    }

    // Từ khóa sự kiện: Tốt nghiệp / Bằng cử nhân
    if (query.includes('tốt nghiệp') || query.includes('cử nhân') || query.includes('học sĩ') || query.includes('trao bằng')) {
      if (['ao-vien-linh', 'ao-giao-linh', 'ao-ngu-than'].includes(costume.id)) {
        score += 35;
        matchReasons.push('Biểu trưng cho đạo học nho nhã và khí phách sĩ tử Đại Việt');
      } else {
        score += 10;
      }
    }

    // Từ khóa sự kiện: Dạo phố / Cà phê / Cuối tuần
    if (query.includes('dạo phố') || query.includes('cà phê') || query.includes('chụp ảnh') || query.includes('cuối tuần') || query.includes('bạn bè')) {
      if (['ao-ba-ba', 'ao-doi-kham', 'ao-tu-than', 'ao-yem'].includes(costume.id)) {
        score += 30;
        matchReasons.push('Vạt áo thoáng nhẹ, khoan thai và năng động');
      } else {
        score += 15;
      }
    }

    // Từ khóa sự kiện: Triển lãm / Nghệ thuật / Giao lưu quốc tế
    if (query.includes('triển lãm') || query.includes('nghệ thuật') || query.includes('ngoại giao') || query.includes('bảo tàng')) {
      if (['ao-doi-kham', 'ao-dai-lemur', 'ao-giao-linh', 'ao-nhat-binh'].includes(costume.id)) {
        score += 32;
        matchReasons.push('Điểm chạm giao thoa mỹ thuật sâu sắc giữa di sản và hiện đại');
      }
    }

    // Đánh giá theo Thời tiết
    if (weather === 'nong') {
      if (['ao-ba-ba', 'ao-doi-kham', 'ao-yem', 'ao-giao-linh'].includes(costume.id)) {
        score += 20;
        matchReasons.push('Chất liệu và độ mở vạt thoáng mát giải nhiệt ngày oi ả');
      } else if (['ao-tac-ngu-than-tay-thung', 'ao-nhat-binh'].includes(costume.id)) {
        score -= 10;
      }
    } else if (weather === 'lanh') {
      if (['ao-tac-ngu-than-tay-thung', 'ao-ngu-than', 'ao-vien-linh'].includes(costume.id)) {
        score += 20;
        matchReasons.push('Cổ lập lĩnh khép kín và phom áo dày dặn cản gió lạnh');
      } else if (costume.id === 'ao-yem') {
        score -= 25;
      }
    } else if (weather === 'mua') {
      if (['ao-ba-ba', 'ao-ngu-than'].includes(costume.id)) {
        score += 22;
        matchReasons.push('Phom dáng tay chẽn hoặc vạt ngắn không vướng víu khi trời mưa');
      } else if (['ao-tac-ngu-than-tay-thung', 'ao-tu-than'].includes(costume.id)) {
        score -= 15;
      }
    }

    // Đánh giá theo Vùng miền ưu tiên
    if (regionPreference) {
      if (costume.region && costume.region.includes(regionPreference)) {
        score += 12;
        matchReasons.push(`Chuẩn mực văn hóa vùng ${costume.region}`);
      }
    }

    // Điều chỉnh theo tỷ lệ dáng người (nếu có thông tin profile)
    if (userProfile?.height) {
      if (userProfile.height < 160 && costume.silhouetteType === 'fitted') {
        score += 8;
        matchReasons.push('Đường chiết eo và tà thon gọn giúp tôn chiều cao người mặc');
      } else if (userProfile.height >= 165 && costume.silhouetteType === 'loose') {
        score += 8;
        matchReasons.push('Chiều cao lý tưởng giúp tà áo buông rộng rủ nếp thướt tha');
      }
    }

    scoredCostumes.push({ costume, score, matchReasons });
  }

  // Sắp xếp giảm dần theo điểm
  scoredCostumes.sort((a, b) => b.score - a.score);

  // Chọn 3 trang phục KHÁC NHAU đứng đầu
  const top3 = scoredCostumes.slice(0, 3);

  // Fallback nếu vì lý do nào đó không đủ 3
  while (top3.length < 3) {
    const fallbackCostume = OFFICIAL_TRADITIONAL_COSTUMES.find(c => !top3.some(t => t.costume.id === c.id));
    if (!fallbackCostume) break;
    top3.push({ costume: fallbackCostume, score: 60, matchReasons: ['Phương án dự phòng tao nhã'] });
  }

  // 2. Chuyển đổi thành 3 MixOption hoàn chỉnh
  const results: MixOption[] = top3.map((item, index) => {
    const c = item.costume;
    const meta = COSTUME_PROFILES[c.id] || {
      id: c.id,
      tags: [],
      formalityScore: 3,
      warmthLevel: 3,
      rainSuitability: 3,
      primaryColor: TRADITIONAL_COLORS[0],
      matchingModern: MODERN_GARMENTS[1],
      matchingShoes: MODERN_GARMENTS[3],
      matchingAccessories: [ACCESSORY_ITEMS[1]],
      matchingModernColor: MODERN_COLORS[0]
    };

    const m = meta.matchingModern;
    const shoes = meta.matchingShoes;
    const accList = meta.matchingAccessories;
    const tradColor = meta.primaryColor;
    const modColor = meta.matchingModernColor;

    // Tính harmonyScore động từ các quy tắc phối hợp
    let dynamicHarmony = 86;
    if (meta.formalityScore >= 4 && query.includes('cưới')) dynamicHarmony += 6;
    if (weather === 'nong' && meta.warmthLevel <= 2) dynamicHarmony += 4;
    if (weather === 'lanh' && meta.warmthLevel >= 3) dynamicHarmony += 4;
    if (weather === 'mua' && meta.rainSuitability >= 4) dynamicHarmony += 4;
    if (accList.length >= 1 && accList.length <= 2) dynamicHarmony += 2;
    // Điểm thưởng tương phản màu sắc
    if (tradColor.hex !== modColor.hex) dynamicHarmony += 2;

    const finalHarmony = Math.min(98, dynamicHarmony - (index * 2));

    const weatherText = weather === 'nong' ? 'ngày oi bức' : weather === 'lanh' ? 'trời se lạnh' : weather === 'mua' ? 'trời ẩm ướt' : 'thời tiết mát mẻ';
    const reasonDetail = item.matchReasons.join(', ') || 'Hài hòa giữa phom dáng và thần thái cổ phong';

    const recommendationReason = `Dành riêng cho bạn (${userProfile?.name || 'Khách Quý'}, ${userProfile?.gender === 'male' ? 'Nam' : 'Nữ'}): ${c.name} mang ${reasonDetail}. Trong bối cảnh ${query || 'sự kiện'} và ${weatherText}, cách phối cùng ${m.name} và sắc ${tradColor.name} tạo nên tổng thể thanh tao, đĩnh đạc và đúng chuẩn nếp áo Việt.`;

    const culturalCheck = evaluateOutfitMix({
      costume: c,
      outer: c,
      bottom: m,
      shoes,
      accessories: accList,
      traditionalColor: tradColor,
      modernColor: modColor,
      eventContext: eventDescription
    });

    return {
      id: `mix-rec-${c.id}-${index}-${Date.now()}`,
      name: `${c.name} × ${m.name}`,
      event: eventDescription || 'Giao lưu văn hóa & Sự kiện di sản',
      costume: c,
      modernGarment: m,
      accessories: accList,
      colorPalette: [tradColor, modColor],
      harmonyScore: finalHarmony,
      recommendationReason,
      frontImage: c.frontImage,
      backImage: c.backImage,
      culturalCheck
    };
  });

  return results;
}
