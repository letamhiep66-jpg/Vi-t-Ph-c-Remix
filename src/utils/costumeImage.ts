export const COSTUME_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const;

const COSTUME_FALLBACK_CANDIDATES: Record<string, string[]> = {
  'ao-giao-linh': [
    '/images/costumes/ao-giao-linh.png',
    '/images/costumes/01 áo giao lĩnh1.png',
    '/images/costumes/ao-giao-linh.jpg'
  ],
  'ao-vien-linh': [
    '/images/costumes/ao-vien-linh.jpg',
    '/images/costumes/02 áo viên lĩnh 1.jpg',
    '/images/costumes/ao-vien-linh.png'
  ],
  'ao-doi-kham': [
    '/images/costumes/ao-doi-kham.jpg',
    '/images/costumes/03 áo đối khâm 1.jpg',
    '/images/costumes/ao-doi-kham.png'
  ],
  'ao-tu-than': [
    '/images/costumes/ao-tu-than.jpg',
    '/images/costumes/04. áo tứ thân 1.jpg'
  ],
  'ao-yem': [
    '/images/costumes/ao-yem.jpg',
    '/images/costumes/08. áo yếm 1.jpg'
  ],
  'ao-ngu-than': [
    '/images/costumes/ao-ngu-than.jpg',
    '/images/costumes/05. áo ngũ thân 1.jpg'
  ],
  'ao-tac-ngu-than-tay-thung': [
    '/images/costumes/ao-tac-ngu-than-tay-thung.jpg',
    '/images/costumes/06. áo tấc 1.jpg'
  ],
  'ao-nhat-binh': [
    '/images/costumes/ao-nhat-binh.jpg',
    '/images/costumes/07. áo nhật bình 1.jpg'
  ],
  'ao-ba-ba': [
    '/images/costumes/ao-ba-ba.png',
    '/images/costumes/09 áo bà ba.png'
  ],
  'ao-dai-lemur': [
    '/images/costumes/ao-dai-lemur.jpg',
    '/images/costumes/10. áo dài le mur 1.jpg'
  ]
};

/**
 * Returns candidate URLs for a costume image.
 * If src is a data URL or starts with http/data:, returns [src].
 * If src already has a known extension, returns [src] plus fallbacks.
 * Otherwise, generates ordered candidates with extensions and filename aliases.
 */
export function getCostumeImageCandidates(src?: string): string[] {
  if (!src) return [];

  const trimmed = src.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return [trimmed];
  }

  // Find matching costume key if available
  let matchedKey: string | undefined;
  for (const key of Object.keys(COSTUME_FALLBACK_CANDIDATES)) {
    if (trimmed.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  const results: string[] = [];

  // If it already ends with a known image extension
  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmed)) {
    results.push(trimmed);
  } else {
    // Generate extension candidates
    COSTUME_IMAGE_EXTENSIONS.forEach((ext) => {
      results.push(`${trimmed}${ext}`);
    });
  }

  // Append known fallbacks
  if (matchedKey && COSTUME_FALLBACK_CANDIDATES[matchedKey]) {
    COSTUME_FALLBACK_CANDIDATES[matchedKey].forEach((fb) => {
      if (!results.includes(fb)) {
        results.push(fb);
      }
    });
  }

  return results;
}
