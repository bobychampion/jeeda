import { uploadImage } from '../services/cloudinaryService.js';
import multer from 'multer';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * Upload image to Cloudinary
 */
export async function uploadImageToCloudinary(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary
    const result = await uploadImage(dataUri, 'jeeda/templates');

    res.json({
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('image');

