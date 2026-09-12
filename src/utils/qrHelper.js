import QRCode from 'qrcode';

/**
 * Generate a styled QR code onto a canvas element with optional center logo
 */
export async function generateStyledQRCode(canvas, text, options = {}) {
  const fgColor = options.fgColor || "#0F172A";
  const bgColor = options.bgColor || "#FFFFFF";
  const size = options.size || 220;
  const logoType = options.logo || "utensils";

  try {
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'H', // High error correction to allow center icon
      color: {
        dark: fgColor,
        light: bgColor,
      }
    });

    // If center icon is requested, draw a stylish center badge
    if (options.showLogo !== false) {
      const ctx = canvas.getContext('2d');
      const center = size / 2;
      const logoRadius = size * 0.14;

      // Draw circular background for icon
      ctx.beginPath();
      ctx.arc(center, center, logoRadius + 3, 0, 2 * Math.PI);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = fgColor;
      ctx.stroke();

      // Inner filled circle
      ctx.beginPath();
      ctx.arc(center, center, logoRadius, 0, 2 * Math.PI);
      ctx.fillStyle = fgColor;
      ctx.fill();

      // Draw Icon emoji / symbol
      ctx.font = `${Math.floor(logoRadius * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let symbol = "🍴";
      if (logoType === "wine") symbol = "🍷";
      else if (logoType === "flame") symbol = "🔥";
      else if (logoType === "coffee") symbol = "☕";
      else if (logoType === "burger") symbol = "🍔";

      ctx.fillText(symbol, center, center + 1);
    }
  } catch (err) {
    console.error("QR Code Generation Error:", err);
  }
}

/**
 * Download canvas as PNG
 */
export function downloadCanvasPNG(canvas, filename = "menu-qr-code.png") {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
