const QRCode = require("qrcode");
const { customError } = require("../utils/customError.js");
// generate a qr code
exports.generateProductqrcode = async (link) => {
  try {
    return await QRCode.toDataURL(link, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000", // QR code color
        light: "#FFFFFF", // Background color
      },
    });
  } catch (error) {
    console.error("Error:", error);
    throw new customError(400, "Qr  Code Generation Failed");
  }
};
