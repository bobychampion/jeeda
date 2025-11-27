/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder path in storage (default: 'jeeda/templates')
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadImage = async (file, folder = 'jeeda/templates') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'templates');
    formData.append('folder', folder);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file. You can find your cloud name in your Cloudinary Dashboard (https://cloudinary.com/console) - it\'s shown at the top of the page.');
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} folder - Folder path in storage
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleImages = async (files, folder = 'jeeda/templates') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};
