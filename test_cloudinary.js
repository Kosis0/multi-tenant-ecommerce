require('dotenv').config();
const cloudinary = require('cloudinary').v2;

async function testUpload() {
  try {
    const res = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', {
      folder: 'test_folder'
    });
    console.log('Upload success:', res.secure_url);
  } catch (err) {
    console.error('Upload failed:', err);
  }
}

testUpload();
