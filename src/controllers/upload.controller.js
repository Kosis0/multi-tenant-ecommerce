const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/response');

const uploadImage = async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No image file uploaded');
  }

  if (isCloudinaryConfigured && cloudinary) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `stores/${req.tenant.slug}`, resource_type: 'image' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    return sendSuccess(res, { url: result.secure_url });
  }

  // Disk fallback URL
  const host = req.get('host');
  const protocol = req.protocol;
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  return sendSuccess(res, { url: imageUrl });
};

module.exports = {
  uploadImage
};
