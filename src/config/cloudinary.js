const cloudinary = require('cloudinary').v2;
const env = require('./env');

const isConfigured = Boolean(env.CLOUDINARY_URL);

if (isConfigured) {
  cloudinary.config({
    cloudinary_url: env.CLOUDINARY_URL
  });
}

module.exports = {
  cloudinary,
  isConfigured
};
