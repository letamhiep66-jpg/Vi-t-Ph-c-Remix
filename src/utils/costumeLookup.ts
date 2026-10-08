import { OFFICIAL_TRADITIONAL_COSTUMES } from '../data/costumesData';
import { TraditionalCostume } from '../types';

/**
 * Danh sách 10 ID chuẩn hoá chính thức của bộ sưu tập Việt Phục
 */
export const CANONICAL_COSTUME_IDS = [
  'ao-giao-linh',
  'ao-vien-linh',
  'ao-doi-kham',
  'ao-tu-than',
  'ao-yem',
  'ao-ngu-than',
  'ao-tac-ngu-than-tay-thung',
  'ao-nhat-binh',
  'ao-ba-ba',
  'ao-dai-lemur',
] as const;

export type CanonicalCostumeId = typeof CANONICAL_COSTUME_IDS[number];

/**
 * Bản đồ quy đổi các ID cũ / alias về ID chuẩn mới
 */
export const LEGACY_ID_MAP: Record<string, CanonicalCostumeId> = {
  'ao-yem-co-truyen': 'ao-yem',
  'ao-tac': 'ao-tac-ngu-than-tay-thung',
  'ao-tac-tay-thung': 'ao-tac-ngu-than-tay-thung',
  'ao-tac-ngu-than': 'ao-tac-ngu-than-tay-thung',
  'ao-dai-truyen-thong': 'ao-dai-lemur',
  'ao-dai-ngu-than-nam': 'ao-ngu-than',
  'ao-dai-nam': 'ao-ngu-than',
  'ao-ngu-than-nam': 'ao-ngu-than',
  'ao-ngu-than-nu': 'ao-ngu-than',
};

/**
 * Quy tắc phân lớp slot:
 * - 'ao-yem' là lớp trong (inner_top)
 * - 9 món còn lại là áo chính ngoài (outer_top)
 */
export const COSTUME_SLOT: Record<CanonicalCostumeId, 'inner_top' | 'outer_top'> = {
  'ao-yem': 'inner_top',
  'ao-giao-linh': 'outer_top',
  'ao-vien-linh': 'outer_top',
  'ao-doi-kham': 'outer_top',
  'ao-tu-than': 'outer_top',
  'ao-ngu-than': 'outer_top',
  'ao-tac-ngu-than-tay-thung': 'outer_top',
  'ao-nhat-binh': 'outer_top',
  'ao-ba-ba': 'outer_top',
  'ao-dai-lemur': 'outer_top',
};

/**
 * Chuẩn hoá ID trang phục
 */
export function normalizeCostumeId(id?: string | null): string {
  if (!id) return '';
  const clean = id.trim();
  if (clean in LEGACY_ID_MAP) {
    return LEGACY_ID_MAP[clean];
  }
  return clean;
}

/**
 * Lấy trang phục theo ID (tự động ánh xạ ID cũ về ID mới)
 */
export function getCostumeById(id?: string | null): TraditionalCostume | undefined {
  if (!id) return undefined;
  const canonicalId = normalizeCostumeId(id);
  return OFFICIAL_TRADITIONAL_COSTUMES.find((c) => c.id === canonicalId);
}

/**
 * Lấy slot mặc định của trang phục ('inner_top' hoặc 'outer_top')
 */
export function getCostumeSlot(id?: string | null): 'inner_top' | 'outer_top' {
  const canonicalId = normalizeCostumeId(id) as CanonicalCostumeId;
  return COSTUME_SLOT[canonicalId] || 'outer_top';
}

/**
 * Kiểm tra xem ID có phải là Áo Yếm (lớp trong) hay không
 */
export function isInnerCostume(id?: string | null): boolean {
  return normalizeCostumeId(id) === 'ao-yem';
}
