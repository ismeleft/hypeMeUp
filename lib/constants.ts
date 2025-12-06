/**
 * 專案共用常數定義
 */

/**
 * 有效的成就分類
 */
export const VALID_CATEGORIES = [
  'Project',
  'Learning',
  'Communication',
  'Firefighting',
] as const;

export type Category = (typeof VALID_CATEGORIES)[number];

/**
 * 影響力評分範圍
 */
export const IMPACT_MIN = 1;
export const IMPACT_MAX = 5;

/**
 * 驗證影響力評分是否有效
 */
export function isValidImpact(impact: number): boolean {
  return Number.isInteger(impact) && impact >= IMPACT_MIN && impact <= IMPACT_MAX;
}

/**
 * 驗證分類是否有效
 */
export function isValidCategory(category: string): category is Category {
  return VALID_CATEGORIES.includes(category as Category);
}
