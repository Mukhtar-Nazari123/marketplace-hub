import { supabase } from '@/integrations/supabase/client';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { generateSKU } from '@/lib/skuGenerator';

interface SaveProductOptions {
  userId: string;
  productId?: string | null;
  formData: ProductFormData;
  imageUrls: string[];
  videoUrl: string;
  status: 'draft' | 'pending' | 'active';
  currentLanguage: 'en' | 'fa' | 'ps';
}

interface SaveProductResult {
  productId: string;
  success: boolean;
  error?: string;
}

/**
 * Save product data to normalized tables:
 * - products: core data (prices, category, status, etc.)
 * - product_translations: language-specific content (name, description, etc.)
 * - product_media: images and videos
 * - product_attributes: specifications and category-specific attributes
 */
export async function saveProduct(options: SaveProductOptions): Promise<SaveProductResult> {
  const { userId, productId, formData, imageUrls, videoUrl, status, currentLanguage } = options;

  try {
    // Generate SKU
    const generatedSKU = generateSKU(formData.categoryId, formData.categoryName, formData.name || 'DRAFT');
    const slug = formData.name 
      ? formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() 
      : `draft-${Date.now()}`;

    // 1. Save/Update core product data (NO name/description - those go to translations)
    const productData = {
      seller_id: userId,
      slug,
      price_afn: formData.price || 0,
      compare_price_afn: formData.discountPrice,
      quantity: formData.quantity,
      sku: generatedSKU,
      category_id: formData.categoryId || null,
      subcategory_id: formData.subCategoryId || null,
      status,
      delivery_fee: formData.deliveryFee || 0,
      // Keep minimal metadata for non-translatable data
      metadata: {
        stockPerSize: formData.stockPerSize,
        videoUrl, // Temporarily keep video URL in metadata until we fully migrate to product_media
      },
      // Keep images array for backward compatibility during transition
      images: imageUrls,
      // Store base name for admin notifications (will be overwritten by translations on display)
      name: formData.name || 'Untitled',
      description: formData.description || null,
    };

    let finalProductId = productId;

    if (productId) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (error) throw error;
      finalProductId = data.id;
    }

    if (!finalProductId) {
      throw new Error('Failed to get product ID');
    }

    // 2. Save translations for the current language
    await saveProductTranslation(finalProductId, currentLanguage, {
      name: formData.name,
      description: formData.description,
      short_description: formData.shortDescription,
      meta_title: formData.name, // Default meta title to product name
      meta_description: formData.shortDescription || formData.description?.substring(0, 160),
    });

    // 3. Save media to product_media table
    await saveProductMedia(finalProductId, imageUrls, videoUrl);

    // 4. Save attributes to product_attributes table
    await saveProductAttributes(finalProductId, formData.attributes, formData.brand, currentLanguage);

    return { productId: finalProductId, success: true };
  } catch (error) {
    console.error('Error saving product:', error);
    return { 
      productId: productId || '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Save or update product translation for a specific language
 */
async function saveProductTranslation(
  productId: string, 
  language: 'en' | 'fa' | 'ps',
  data: {
    name: string;
    description: string;
    short_description: string;
    meta_title?: string;
    meta_description?: string;
    specifications?: Record<string, string>;
  }
) {
  // Check if translation exists
  const { data: existing } = await supabase
    .from('product_translations')
    .select('id')
    .eq('product_id', productId)
    .eq('language', language)
    .maybeSingle();

  const translationData = {
    name: data.name || null,
    description: data.description || null,
    short_description: data.short_description || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    specifications: data.specifications || {},
  };

  if (existing) {
    // Update existing translation
    const { error } = await supabase
      .from('product_translations')
      .update(translationData)
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    // Insert new translation
    const { error } = await supabase
      .from('product_translations')
      .insert({
        product_id: productId,
        language,
        ...translationData,
      });

    if (error) throw error;
  }
}

/**
 * Save product media (images and videos) to product_media table
 */
async function saveProductMedia(productId: string, imageUrls: string[], videoUrl: string) {
  // Get existing media for this product
  const { data: existingMedia } = await supabase
    .from('product_media')
    .select('id, url')
    .eq('product_id', productId);

  const existingUrls = new Set(existingMedia?.map(m => m.url) || []);
  const newUrls = new Set([...imageUrls, videoUrl].filter(Boolean));

  // Find media to add (in new but not in existing)
  const toAdd: { url: string; type: 'image' | 'video'; order: number }[] = [];
  
  imageUrls.forEach((url, index) => {
    if (!existingUrls.has(url)) {
      toAdd.push({ url, type: 'image', order: index });
    }
  });

  if (videoUrl && !existingUrls.has(videoUrl)) {
    toAdd.push({ url: videoUrl, type: 'video', order: imageUrls.length });
  }

  // Find media to remove (in existing but not in new)
  const toRemove = existingMedia?.filter(m => !newUrls.has(m.url)).map(m => m.id) || [];

  // Delete removed media
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('product_media')
      .delete()
      .in('id', toRemove);

    if (error) console.error('Error deleting media:', error);
  }

  // Insert new media
  if (toAdd.length > 0) {
    const mediaToInsert = toAdd.map(m => ({
      product_id: productId,
      media_type: m.type,
      url: m.url,
      sort_order: m.order,
      is_primary: m.order === 0 && m.type === 'image',
    }));

    const { error } = await supabase
      .from('product_media')
      .insert(mediaToInsert);

    if (error) console.error('Error inserting media:', error);
  }

  // Update sort order for existing images
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const existing = existingMedia?.find(m => m.url === url);
    if (existing) {
      await supabase
        .from('product_media')
        .update({ sort_order: i, is_primary: i === 0 })
        .eq('id', existing.id);
    }
  }
}

/**
 * Save product attributes to product_attributes table
 */
async function saveProductAttributes(
  productId: string, 
  attributes: Record<string, string | boolean | string[]>,
  brand: string,
  language: 'en' | 'fa' | 'ps'
) {
  // Delete existing attributes for this product and language
  const { error: deleteError } = await supabase
    .from('product_attributes')
    .delete()
    .eq('product_id', productId)
    .or(`language_code.eq.${language},language_code.is.null`);

  if (deleteError) console.error('Error deleting attributes:', deleteError);

  // Prepare attributes to insert
  const attributesToInsert: Array<{
    product_id: string;
    attribute_key: string;
    attribute_value: string;
    language_code: string | null;
    sort_order: number;
  }> = [];

  let sortOrder = 0;

  // Add brand as a universal attribute (no language code)
  if (brand) {
    attributesToInsert.push({
      product_id: productId,
      attribute_key: 'brand',
      attribute_value: brand,
      language_code: null,
      sort_order: sortOrder++,
    });
  }

  // Add other attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === '') continue;

    let stringValue: string;
    if (typeof value === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (Array.isArray(value)) {
      stringValue = value.join(', ');
    } else {
      stringValue = String(value);
    }

    // Determine if this attribute is language-specific or universal
    // Size, color codes, technical specs are usually universal
    // Labels/descriptions might be language-specific
    const isUniversal = ['size', 'color', 'weight', 'dimensions', 'material_code'].includes(key.toLowerCase());

    attributesToInsert.push({
      product_id: productId,
      attribute_key: key,
      attribute_value: stringValue,
      language_code: isUniversal ? null : language,
      sort_order: sortOrder++,
    });
  }

  // Insert all attributes
  if (attributesToInsert.length > 0) {
    const { error } = await supabase
      .from('product_attributes')
      .insert(attributesToInsert);

    if (error) console.error('Error inserting attributes:', error);
  }
}

/**
 * Load product data from normalized tables
 */
export async function loadProductWithTranslations(
  productId: string, 
  language: 'en' | 'fa' | 'ps' = 'en'
) {
  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError) throw productError;

  // Fetch translation for current language (with fallback chain)
  const { data: translations } = await supabase
    .from('product_translations')
    .select('*')
    .eq('product_id', productId)
    .in('language', [language, 'fa', 'en']);

  // Find best translation (current language → fa → en)
  const translation = translations?.find(t => t.language === language) 
    || translations?.find(t => t.language === 'fa')
    || translations?.find(t => t.language === 'en');

  // Fetch attributes
  const { data: attributes } = await supabase
    .from('product_attributes')
    .select('*')
    .eq('product_id', productId)
    .or(`language_code.eq.${language},language_code.is.null`)
    .order('sort_order');

  // Convert attributes array to object
  const attributesObj: Record<string, string> = {};
  let brand = '';
  attributes?.forEach(attr => {
    if (attr.attribute_key === 'brand') {
      brand = attr.attribute_value;
    } else {
      attributesObj[attr.attribute_key] = attr.attribute_value;
    }
  });

  // Fetch media
  const { data: media } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order');

  const imageUrls = media?.filter(m => m.media_type === 'image').map(m => m.url) || product.images || [];
  const videoMedia = media?.find(m => m.media_type === 'video');
  const videoUrl = videoMedia?.url || (product.metadata as any)?.videoUrl || '';

  return {
    product,
    translation,
    attributes: attributesObj,
    brand,
    imageUrls,
    videoUrl,
  };
}

