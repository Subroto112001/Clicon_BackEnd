const http = require("http");
const bwipjs = require("bwip-js");



exports.barcodeGenerator = async(code) => {
    try {
     return await bwipjs.toSVG({
       bcid: "code128", // Barcode type
       text: code, // Text to encode
       height: 12, // Bar height, in millimeters
       includetext: true, // Show human-readable text
       textxalign: "center", // Always good to set this
       textcolor: "ff0000", // Red text
     });
    } catch (error) {
        console.error('Error:', error);
        throw new customError(500, "Bar code generation failed");
    }
}