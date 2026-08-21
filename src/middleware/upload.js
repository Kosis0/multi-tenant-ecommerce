const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const { BadRequestError } = require('../errors');

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Ensure uploads directory exists on disk for local storage mode
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const useCloudinary = Boolean(env.CLOUDINARY_URL);

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

const storage = useCloudinary ? multer.memoryStorage() : diskStorage;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !file.mimetype.startsWith('image/')) {
    return cb(new BadRequestError('Only image files (JPG, PNG, WEBP, GIF) are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

module.exports = upload;
module.exports.uploadsDir = uploadsDir;
