/**
 * Utilities for Vietnamese text normalization and fuzzy searching
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];

  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Fuzzy search matches query against text.
 * Returns true if text matches query directly, as normalized substring,
 * or within a forgiving fuzzy edit distance.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  if (!query || !query.trim()) return true;
  if (!text) return false;

  const rawQuery = query.toLowerCase().trim();
  const rawText = text.toLowerCase();
  if (rawText.includes(rawQuery)) return true;

  const cleanQuery = removeVietnameseTones(query);
  const cleanText = removeVietnameseTones(text);

  if (cleanText.includes(cleanQuery)) return true;

  // Word-by-word fuzzy match
  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
  const textWords = cleanText.split(/\s+/).filter(Boolean);

  return queryWords.every((qWord) => {
    // Exact or prefix in any text word
    if (textWords.some((tWord) => tWord.includes(qWord) || qWord.includes(tWord))) {
      return true;
    }
    // Typo match for words > 2 chars
    if (qWord.length > 2) {
      return textWords.some((tWord) => levenshteinDistance(qWord, tWord) <= 1);
    }
    return false;
  });
}
