import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload image to Cloudinary
 * @param {string|Buffer} image - Image file path or buffer
 * @param {string} folder - Folder path in Cloudinary
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadImage(image, folder = 'jeeda') {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Generate color variation of an image
 * @param {string} publicId - Cloudinary public ID
 * @param {string} color - Color to apply (hex code or color name)
 * @returns {string} - Transformed image URL
 */
export function getColorVariation(publicId, color) {
  // Use Cloudinary overlays and color effects
  const colorMap = {
    'brown': '#8B4513',
    'black': '#000000',
    'white': '#FFFFFF',
    'oak': '#D2B48C',
    'walnut': '#5C4033',
    'pine': '#F5DEB3',
  };

  const hexColor = colorMap[color.toLowerCase()] || color;

  // Extract RGB from hex
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Apply color overlay transformation
  const url = cloudinary.url(publicId, {
    transformation: [
      {
        overlay: `color:${hexColor}`,
        opacity: 30,
        blend_mode: 'multiply',
      },
      {
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  });

  return url;
}

/**
 * Generate material texture overlay
 * @param {string} publicId - Cloudinary public ID
 * @param {string} material - Material type (wood, metal, etc.)
 * @returns {string} - Transformed image URL
 */
export function getMaterialVariation(publicId, material) {
  // Apply material-specific transformations
  const materialEffects = {
    'wood': { effect: 'art:wood', },
    'metal': { effect: 'art:metal', },
    'fabric': { effect: 'art:fabric', },
  };

  const effect = materialEffects[material.toLowerCase()] || {};

  const url = cloudinary.url(publicId, {
    transformation: [
      effect,
      {
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  });

  return url;
}

export default cloudinary;

