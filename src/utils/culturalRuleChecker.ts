import { 
  CulturalCheck, 
  CulturalStatus, 
  TraditionalCostume, 
  ModernGarment, 
  AccessoryItem, 
  ColorItem, 
  UserWardrobeItem 
} from '../types';
import { normalizeCostumeId } from './costumeLookup';

export interface FullOutfitCheckInput {
  costume: TraditionalCostume;
  outer?: TraditionalCostume | ModernGarment | UserWardrobeItem | null;
  inner?: TraditionalCostume | ModernGarment | UserWardrobeItem | null;
  bottom?: ModernGarment | UserWardrobeItem | null;
  shoes?: ModernGarment | UserWardrobeItem | null;
  accessories?: (AccessoryItem | UserWardrobeItem | null)[] | AccessoryItem | UserWardrobeItem | null;
  traditionalColor: ColorItem;
  modernColor: ColorItem;
  eventContext?: string;
}

/**
 * Đánh giá tính chuẩn mực văn hóa của bộ trang phục phối hợp (Remix)
 * Hỗ trợ nhận cả bộ đầy đủ (outer, inner, bottom, shoes, accessories)
 * hoặc chữ ký hàm truyền thống để tương thích ngược.
 */
export function evaluateOutfitMix(
  costumeOrFull: TraditionalCostume | FullOutfitCheckInput,
  modernItemParam?: ModernGarment | UserWardrobeItem | null,
  accessoryParam?: AccessoryItem | UserWardrobeItem | null,
  traditionalColorParam?: ColorItem,
  modernColorParam?: ColorItem,
  eventContextParam?: string
): CulturalCheck {
  // Parse inputs based on signature
  let costume: TraditionalCostume;
  let outer: TraditionalCostume | ModernGarment | UserWardrobeItem | null = null;
  let inner: TraditionalCostume | ModernGarment | UserWardrobeItem | null = null;
  let bottom: ModernGarment | UserWardrobeItem | null = null;
  let shoes: ModernGarment | UserWardrobeItem | null = null;
  let accessoriesList: (AccessoryItem | UserWardrobeItem)[] = [];
  let traditionalColor: ColorItem;
  let modernColor: ColorItem;
  let eventContext = '';

  if ('traditionalColor' in costumeOrFull && 'modernColor' in costumeOrFull) {
    const full = costumeOrFull as FullOutfitCheckInput;
    costume = full.costume;
    outer = full.outer || null;
    inner = full.inner || null;
    bottom = full.bottom || null;
    shoes = full.shoes || null;
    if (Array.isArray(full.accessories)) {
      accessoriesList = full.accessories.filter(Boolean) as (AccessoryItem | UserWardrobeItem)[];
    } else if (full.accessories) {
      accessoriesList = [full.accessories];
    }
    traditionalColor = full.traditionalColor;
    modernColor = full.modernColor;
    eventContext = full.eventContext || '';
  } else {
    costume = costumeOrFull as TraditionalCostume;
    const modernItem = modernItemParam || null;
    if (modernItem && 'category' in modernItem) {
      if (modernItem.category === 'jacket') outer = modernItem;
      else if (modernItem.category === 'pants' || modernItem.category === 'skirt') bottom = modernItem;
      else if (modernItem.category === 'shoes') shoes = modernItem;
      else inner = modernItem;
    }
    if (accessoryParam) accessoriesList = [accessoryParam];
    traditionalColor = traditionalColorParam || { id: 'c1', name: 'Đỏ son', hex: '#9B2226', type: 'traditional', meaning: 'Son sắc' };
    modernColor = modernColorParam || { id: 'c2', name: 'Trắng kem', hex: '#FDFBF7', type: 'modern', meaning: 'Tinh tế' };
    eventContext = eventContextParam || '';
  }

  const costumeId = normalizeCostumeId(costume?.id || '');
  const eventLower = eventContext.toLowerCase();

  // -------------------------------------------------------------
  // 1. EVALUATE SILHOUETTE (PHOM DÁNG & CẤU TRÚC ÁO)
  // -------------------------------------------------------------
  let silhouetteStatus: CulturalStatus = 'green';
  let silhouetteNote = 'Phom dáng bảo tồn tốt vẻ trang nghiêm và cấu trúc tà áo di sản.';
  let silhouetteSuggestion: string | undefined = undefined;

  // Rule: Áo Nhật Bình
  if (costumeId === 'ao-nhat-binh') {
    if (outer && outer.id !== costume.id && 'category' in outer && outer.category === 'jacket') {
      silhouetteStatus = 'red';
      silhouetteNote = 'Áo Nhật Bình có bản cổ chữ nhật và dải ngũ sắc tay áo đặc trưng, không được khoác áo khoác hiện đại trùm lên che mất điển chế hoàng gia.';
      silhouetteSuggestion = 'Nên mặc Nhật Bình như lớp ngoài cùng, bên trong lót áo cổ thìa hoặc áo năm thân lụa trơn.';
    }
  }

  // Rule: Áo Tấc (Áo ngũ thân tay thụng)
  if (costumeId === 'ao-tac-ngu-than-tay-thung') {
    if (outer && outer.id !== costume.id && 'category' in outer && outer.category === 'jacket') {
      silhouetteStatus = 'yellow';
      silhouetteNote = 'Áo Tấc có tay thụng rộng 40 - 50cm đặc thù, mặc áo khoác bó bên ngoài sẽ làm gò bó và nhăn nếp tay thụng.';
      silhouetteSuggestion = 'Mặc Áo Tấc độc lập để hai ống tay buông rủ uy nghiêm đúng lễ nghi triều Nguyễn.';
    }
    if (shoes && 'name' in shoes) {
      const sName = shoes.name.toLowerCase();
      if (sName.includes('crocs') || sName.includes('dép') || sName.includes('sandal')) {
        silhouetteStatus = 'red';
        silhouetteNote = 'Áo Tấc là đại lễ phục mang tính trang trọng bậc nhất, phối cùng dép lê hoặc dép xuồng phá vỡ hoàn toàn tính tôn nghiêm.';
        silhouetteSuggestion = 'Thay bằng hài thêu truyền thống, giày da âu hoặc chelsea boots da mờ.';
      }
    }
  }

  // Rule: Áo Yếm
  if (costumeId === 'ao-yem' || isInnerOnly(costumeId)) {
    const isFormalOccasion = eventLower.includes('cưới') || eventLower.includes('lễ') || eventLower.includes('chùa') || eventLower.includes('ngoại giao');
    if (isFormalOccasion && !outer) {
      silhouetteStatus = 'yellow';
      silhouetteNote = 'Áo Yếm vốn là nội phục e ấp; trong không gian lễ nghi trang trọng cần khoác thêm áo ngoài (Tứ Thân, Đối Khâm hoặc Áo Tấc).';
      silhouetteSuggestion = 'Khoác thêm áo Đối Khâm lụa mỏng hoặc áo Tứ Thân bên ngoài để giữ nếp đoan trang.';
    }
  }

  // Rule: Áo Đối Khâm
  if (costumeId === 'ao-doi-kham') {
    if (!inner) {
      silhouetteStatus = 'green';
      silhouetteNote = 'Áo Đối Khâm hai vạt song song buông thẳng tao nhã, có thể khép nhẹ trước ngực hoặc phối áo yếm lót bên trong.';
    }
  }

  // Rule: Áo Viên Lĩnh
  if (costumeId === 'ao-vien-linh') {
    silhouetteNote = 'Cổ tròn khép kín cài khuy lệch vai phải tạo phong thái trang trọng, nho nhã của học sĩ Đại Việt.';
  }

  // Rule: Áo Giao Lĩnh
  if (costumeId === 'ao-giao-linh') {
    silhouetteNote = 'Quy chuẩn hữu nhậm (vạt phải đè vạt trái) chuẩn mực chữ V thanh thoát giữa thiên nhiên non nước.';
  }

  // Rule: Áo Bà Ba
  if (costumeId === 'ao-ba-ba') {
    if (bottom && 'category' in bottom && bottom.category === 'skirt') {
      silhouetteStatus = 'green';
      silhouetteNote = 'Áo Bà Ba phối chân váy cách tân mang lại vẻ duyên dáng, nữ tính và thoáng mát.';
    }
  }

  // Rule: Áo Dài Le Mur
  if (costumeId === 'ao-dai-lemur') {
    silhouetteNote = 'Phom dáng giao thời Đông Dương thập niên 1930 chiết eo kiều diễm, ăn khớp hoàn hảo với phụ kiện cổ điển.';
  }

  // -------------------------------------------------------------
  // 2. EVALUATE ACCESSORIES (PHỤ KIỆN ĐI KÈM)
  // -------------------------------------------------------------
  let accessoryStatus: CulturalStatus = 'green';
  let accessoryNote = 'Phụ kiện điểm xuyết chừng mực, hòa hợp giữa hồn cốt di sản và phong vị đương đại.';
  let accessorySuggestion: string | undefined = undefined;

  for (const acc of accessoriesList) {
    const accName = acc.name.toLowerCase();
    if (accName.includes('vương miện phương tây') || accName.includes('mũ cao bồi') || accName.includes('tiara')) {
      accessoryStatus = 'red';
      accessoryNote = 'Phụ kiện lệch chuẩn phong tục cổ truyền, tạo cảm giác trang phục hóa trang (cosplay) thiếu sự nghiêm cẩn.';
      accessorySuggestion = 'Thay bằng khăn đóng quấn nếp chữ Nhân, trâm cài bạc hoặc quạt trầm hương.';
      break;
    } else if (accName.includes('kính râm') || accName.includes('retro')) {
      accessoryStatus = 'green';
      accessoryNote = 'Kính mắt gọng đồi mồi vintage tạo điểm chạm phong cách Đông Dương rất có gu thẩm mỹ.';
    } else if (accName.includes('đồng hồ') || accName.includes('balo') || accName.includes('thể thao')) {
      accessoryStatus = 'yellow';
      accessoryNote = 'Phụ kiện thể thao hoặc balo hiện đại tương phản mạnh với nét hoài niệm cổ trang.';
      accessorySuggestion = 'Thay bằng túi cói, túi gấm thêu hoặc clutch da cầm tay tối giản.';
    } else if (accName.includes('nón lá') && costumeId === 'ao-ngu-than') {
      accessoryStatus = 'yellow';
      accessoryNote = 'Áo Ngũ Thân chuẩn mực không phối cùng Nón Lá; hãy dùng Khăn Đóng cho nam, hoặc Khăn Lươn / Khăn Vành cho nữ (ra ngoài che nắng có thể dùng Nón Ba Tầm).';
      accessorySuggestion = 'Chuyển sang Khăn Đóng (nam), Khăn Lươn / Khăn Vành (nữ) hoặc Nón Ba Tầm.';
    } else if (accName.includes('nón lá') && costumeId === 'ao-yem') {
      accessoryStatus = 'green';
      accessoryNote = 'Áo Yếm phối Nón Lá che nghiêng e ấp, kiềng bạc và guốc mộc tôn vinh vẻ đẹp thôn dã truyền thống.';
    } else if (accName.includes('khăn đóng') || accName.includes('chuỗi ngọc') || accName.includes('quạt') || accName.includes('khăn lươn') || accName.includes('khăn vành')) {
      accessoryStatus = 'green';
      accessoryNote = 'Phụ kiện cổ phong chuẩn mực, tôn vinh phong thái trang nhã của cổ phục.';
    }
  }

  // -------------------------------------------------------------
  // 3. EVALUATE COLOR & OCCASION (SẮC MÀU VÀ NGỮ CẢNH DỊP DÙNG)
  // -------------------------------------------------------------
  let occasionColorStatus: CulturalStatus = 'green';
  let occasionColorNote = `Sắc ${traditionalColor.name} phối cùng ${modernColor.name} tạo nên vẻ đẹp hòa sắc tinh tế.`;
  let occasionColorSuggestion: string | undefined = undefined;

  // Black warning in wedding
  if (
    (traditionalColor.hex === '#1C1917' || traditionalColor.hex === '#000000' || traditionalColor.name.toLowerCase().includes('đen')) &&
    (modernColor.hex === '#212529' || modernColor.hex === '#000000' || modernColor.name.toLowerCase().includes('đen')) &&
    eventLower.includes('cưới')
  ) {
    occasionColorStatus = 'red';
    occasionColorNote = 'Phối toàn bộ trang phục màu đen u ám trong ngày vui cưới hỏi là điều kiêng kỵ trong phong tục Việt.';
    occasionColorSuggestion = 'Chuyển sang sắc Đỏ điều, Vàng hoàng yến hoặc Xanh ngọc bích tươi tắn.';
  }

  // Royal yellow warning for guests
  if (
    traditionalColor.name.toLowerCase().includes('vàng chính sắc') ||
    traditionalColor.hex.toLowerCase() === '#f4a261' ||
    traditionalColor.name.toLowerCase().includes('vàng hoàng')
  ) {
    if (eventLower.includes('cưới') && !eventLower.includes('cô dâu') && !eventLower.includes('chú rể')) {
      occasionColorStatus = 'yellow';
      occasionColorNote = 'Sắc vàng chính sắc rất rực rỡ, khách dự tiệc cưới nên khéo léo tiết chế để nhường tâm điểm cho cô dâu chú rể.';
      occasionColorSuggestion = 'Có thể chọn sắc xanh chàm, đỏ son thẫm hoặc tím hoa cà.';
    }
  }

  // Pure white warning for Tet
  if (traditionalColor.name.toLowerCase().includes('trắng toát') && eventLower.includes('tết')) {
    occasionColorStatus = 'yellow';
    occasionColorNote = 'Dịp Tết Nguyên Đán chuộng sắc màu ấm áp sum vầy (Đỏ, Vàng mai, Xanh cốm) hơn gam trắng lạnh.';
    occasionColorSuggestion = 'Thêm điểm nhấn dải yếm hoặc thắt lưng đỏ/hồng tươi tắn.';
  }

  // -------------------------------------------------------------
  // 4. OVERALL SCORE & SUMMARY
  // -------------------------------------------------------------
  let score = 96;
  if (silhouetteStatus === 'red' || accessoryStatus === 'red' || occasionColorStatus === 'red') {
    score -= 30;
  }
  if (silhouetteStatus === 'yellow') score -= 12;
  if ((accessoryStatus as CulturalStatus) === 'yellow') score -= 10;
  if (occasionColorStatus === 'yellow') score -= 8;

  let overallStatus: 'green' | 'yellow' | 'red' = 'green';
  if (score < 65 || silhouetteStatus === 'red' || accessoryStatus === 'red' || occasionColorStatus === 'red') {
    overallStatus = 'red';
  } else if (score < 85 || silhouetteStatus === 'yellow' || occasionColorStatus === 'yellow' || (accessoryStatus as CulturalStatus) === 'yellow') {
    overallStatus = 'yellow';
  }

  let summary = 'Bộ trang phục đạt chuẩn mực văn hóa cao, kết hợp sáng tạo mà vẫn giữ trọn nếp xưa.';
  if (overallStatus === 'yellow') {
    summary = 'Bộ phối có điểm sáng tạo hiện đại, cần tinh chỉnh một vài chi tiết để tổng thể hoàn mỹ hơn.';
  } else if (overallStatus === 'red') {
    summary = 'Có chi tiết chưa phù hợp với điển chế hoặc phong tục cổ truyền, khuyến nghị điều chỉnh theo gợi ý.';
  }

  return {
    overallStatus,
    score: Math.max(45, Math.min(100, score)),
    silhouette: {
      status: silhouetteStatus,
      title: 'Phom Dáng & Cấu Trúc Áo',
      note: silhouetteNote,
      suggestion: silhouetteSuggestion
    },
    accessories: {
      status: accessoryStatus,
      title: 'Phụ Kiện Đi Kèm',
      note: accessoryNote,
      suggestion: accessorySuggestion
    },
    occasionColor: {
      status: occasionColorStatus,
      title: 'Sắc Màu & Phép Ứng Đối Theo Dịp',
      note: occasionColorNote,
      suggestion: occasionColorSuggestion
    },
    summary
  };
}

function isInnerOnly(id: string): boolean {
  return id === 'ao-yem';
}
