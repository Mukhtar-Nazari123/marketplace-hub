/**
 * Auto-generates a unique SKU for products
 * Format: {CATEGORY_CODE}-{PRODUCT_CODE}-{RANDOM_NUMBER}
 * Examples: CL-SHIRT-8392, EL-PHONE-2041
 */

// Category code mappings (3-letter codes)
const CATEGORY_CODES: Record<string, string> = {
  clothing: 'CLO',
  electronics: 'ELC',
  home: 'HOM',
  beauty: 'BTY',
  sports: 'SPT',
  books: 'BOK',
  toys: 'TOY',
  food: 'FOD',
  health: 'HLT',
  automotive: 'AUT',
  jewelry: 'JWL',
  garden: 'GRD',
  office: 'OFC',
  pets: 'PET',
  baby: 'BBY',
  default: 'GEN',
};

/**
 * Sanitizes a string to be used in SKU
 * - Converts to uppercase
 * - Removes special characters and spaces
 * - Takes first 5 characters
 */
const sanitizeForSKU = (text: string): string => {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 5);
};

/**
 * Gets category code from category name/id
 */
const getCategoryCode = (categoryId: string, categoryName: string): string => {
  // First try to match by ID
  if (CATEGORY_CODES[categoryId.toLowerCase()]) {
    return CATEGORY_CODES[categoryId.toLowerCase()];
  }
  
  // Then try to match by name
  const normalizedName = categoryName.toLowerCase();
  for (const [key, code] of Object.entries(CATEGORY_CODES)) {
    if (normalizedName.includes(key)) {
      return code;
    }
  }
  
  // Return first 3 letters of category name or default
  if (categoryName.length >= 3) {
    return sanitizeForSKU(categoryName).substring(0, 3);
  }
  
  return CATEGORY_CODES.default;
};

/**
 * Generates a random number with 3-5 digits
 */
const generateRandomNumber = (): string => {
  const digits = Math.floor(Math.random() * 3) + 3; // 3 to 5 digits
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Generates a product code from product name
 */
const generateProductCode = (productName: string): string => {
  const sanitized = sanitizeForSKU(productName);
  return sanitized.length >= 4 ? sanitized.substring(0, 5) : sanitized.padEnd(4, 'X');
};

/**
 * Generates a unique SKU
 * @param categoryId - The category ID
 * @param categoryName - The category name
 * @param productName - The product name
 * @returns Generated SKU in format: CAT-PROD-12345
 */
export const generateSKU = (
  categoryId: string,
  categoryName: string,
  productName: string
): string => {
  const categoryCode = getCategoryCode(categoryId, categoryName);
  const productCode = generateProductCode(productName);
  const randomNumber = generateRandomNumber();
  
  return `${categoryCode}-${productCode}-${randomNumber}`;
};

/**
 * Validates if a SKU is in the correct format
 */
export const isValidSKU = (sku: string): boolean => {
  const pattern = /^[A-Z]{2,5}-[A-Z0-9]{3,5}-\d{3,5}$/;
  return pattern.test(sku);
};
