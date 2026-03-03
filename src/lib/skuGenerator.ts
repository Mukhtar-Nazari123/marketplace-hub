/**
 * Auto-generates a unique SKU for products
 * Format: {CA}-{SU}-{PR}-{RANDOM}
 * CA = first 2 chars of English category name
 * SU = first 2 chars of English subcategory name
 * PR = first 2 chars of English product name
 * RANDOM = 3-5 digit random number
 */

/**
 * Extracts first 2 uppercase letters from a name
 */
const getTwoCharCode = (name: string): string => {
  const cleaned = name.toUpperCase().replace(/[^A-Z]/g, '');
  return cleaned.length >= 2 ? cleaned.substring(0, 2) : cleaned.padEnd(2, 'X');
};

/**
 * Generates a random number with 3-5 digits
 */
const generateRandomNumber = (): string => {
  const digits = Math.floor(Math.random() * 3) + 3;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Generates a unique SKU
 * @param categoryName - The English category name
 * @param subCategoryName - The English subcategory name
 * @param productName - The English product name
 * @returns Generated SKU in format: CA-SU-PR-12345
 */
export const generateSKU = (
  _categoryId: string,
  categoryName: string,
  productName: string,
  subCategoryName?: string
): string => {
  const catCode = getTwoCharCode(categoryName || 'GN');
  const subCode = getTwoCharCode(subCategoryName || 'GN');
  const prodCode = getTwoCharCode(productName || 'DR');
  const randomNumber = generateRandomNumber();

  return `${catCode}-${subCode}-${prodCode}-${randomNumber}`;
};

/**
 * Validates if a SKU is in the correct format
 */
export const isValidSKU = (sku: string): boolean => {
  const pattern = /^[A-Z]{2}-[A-Z]{2}-[A-Z]{2}-\d{3,5}$/;
  return pattern.test(sku);
};
