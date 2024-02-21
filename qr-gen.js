const fs = require('fs');
const qr = require('qr-image');

function generateQRCode  (text, filePath)  {
  // Create a QR code
  const qrCode = qr.image(text, { type: 'png' });

  // Save the QR code to a file
  qrCode.pipe(fs.createWriteStream(filePath));

  console.log(`QR Code generated and saved to: ${filePath}`);
};

module.exports = { generateQRCode };