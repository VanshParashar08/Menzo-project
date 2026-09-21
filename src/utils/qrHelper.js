import QRCode from 'qrcode';

/**
 * Helper to draw a rounded rectangle on a 2D canvas context
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

let cachedMenzoLogo = null;

function loadMenzoLogo() {
  if (cachedMenzoLogo && cachedMenzoLogo.complete && cachedMenzoLogo.naturalWidth > 0) {
    return Promise.resolve(cachedMenzoLogo);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/menzo-icon.png';
    img.onload = () => {
      cachedMenzoLogo = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
  });
}

/**
 * Generate a styled QR code onto a canvas element with optional center logo
 */
export async function generateStyledQRCode(canvas, text, options = {}) {
  const fgColor = options.fgColor || "#111820";
  const bgColor = options.bgColor || "#FFFFFF";
  const size = options.size || 260;
  const logoType = options.logo || "menzo";

  try {
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'H', // High error correction (30%) to allow center icon safely
      color: {
        dark: fgColor,
        light: bgColor,
      }
    });

    // Reset inline dimensions set by QRCode library so CSS responsive rules apply
    canvas.style.width = '';
    canvas.style.height = '';

    // If center icon is requested, draw a stylish center badge
    if (options.showLogo !== false) {
      const ctx = canvas.getContext('2d');
      const center = size / 2;
      const badgeSize = Math.round(size * 0.22);
      const halfBadge = badgeSize / 2;
      const x = center - halfBadge;
      const y = center - halfBadge;

      // 1. Draw outer white backing to protect QR data modules
      ctx.fillStyle = bgColor;
      drawRoundedRect(ctx, x - 4, y - 4, badgeSize + 8, badgeSize + 8, 8);
      ctx.fill();

      if (logoType === 'menzo') {
        const logoImg = await loadMenzoLogo();
        if (logoImg && logoImg.naturalWidth > 0) {
          ctx.save();
          drawRoundedRect(ctx, x, y, badgeSize, badgeSize, Math.round(badgeSize * 0.22));
          ctx.clip();
          ctx.drawImage(logoImg, x, y, badgeSize, badgeSize);
          ctx.restore();
        } else {
          ctx.fillStyle = '#F4512A';
          drawRoundedRect(ctx, x, y, badgeSize, badgeSize, 6);
          ctx.fill();
        }
      } else {
        // Inner badge
        ctx.fillStyle = fgColor;
        drawRoundedRect(ctx, x, y, badgeSize, badgeSize, 6);
        ctx.fill();

        // Draw emoji or symbol
        ctx.font = `${Math.round(badgeSize * 0.52)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let symbol = "🍴";
        if (logoType === "wine") symbol = "🍷";
        else if (logoType === "flame") symbol = "🔥";
        else if (logoType === "coffee") symbol = "☕";
        else if (logoType === "burger") symbol = "🍔";

        ctx.fillText(symbol, center, center + 1);
      }
    }
  } catch (err) {
    console.error("QR Code Generation Error:", err);
  }
}

/**
 * Generates an ultra high-res 300DPI table tent / acrylic stand graphic
 */
export async function generatePrintStandCanvas({ restaurantName = "The Food Club", tableNumber = "Table 01", targetUrl = "" }) {
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient: warm cream to pure white
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FFFBF9');
  bgGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer decorative border
  ctx.strokeStyle = '#F4512A';
  ctx.lineWidth = 14;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 40);
  ctx.stroke();

  // Subtle inner border
  ctx.strokeStyle = '#F3E8E2';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 60, 60, width - 120, height - 120, 30);
  ctx.stroke();

  // Top Badge: "CONTACTLESS DIGITAL MENU"
  ctx.fillStyle = '#FFF1EC';
  drawRoundedRect(ctx, width / 2 - 190, 110, 380, 52, 26);
  ctx.fill();

  ctx.fillStyle = '#F4512A';
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CONTACTLESS DIGITAL MENU', width / 2, 136);

  // Restaurant Name
  ctx.fillStyle = '#111820';
  ctx.font = '800 68px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(restaurantName.toUpperCase(), width / 2, 230);

  // Subtitle
  ctx.fillStyle = '#6B7280';
  ctx.font = '500 28px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Point your phone camera to browse menu & order', width / 2, 290);

  // QR Code Card Container in center
  const qrBoxX = 250;
  const qrBoxY = 360;
  const qrBoxSize = 700;

  // Card shadow & background
  ctx.save();
  ctx.shadowColor = 'rgba(17, 24, 32, 0.12)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36);
  ctx.fill();
  ctx.restore();

  // Render High-Res QR code
  const tempQrCanvas = document.createElement('canvas');
  tempQrCanvas.width = 600;
  tempQrCanvas.height = 600;

  await generateStyledQRCode(tempQrCanvas, targetUrl || window.location.origin + '/menu.html', {
    fgColor: '#111820',
    bgColor: '#FFFFFF',
    size: 600,
    logo: 'menzo',
    showLogo: true
  });

  ctx.drawImage(tempQrCanvas, qrBoxX + 50, qrBoxY + 50, 600, 600);

  // Table Pill Badge
  ctx.fillStyle = '#111820';
  drawRoundedRect(ctx, width / 2 - 160, 1120, 320, 64, 32);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(tableNumber.toUpperCase(), width / 2, 1152);

  // Scan instruction
  ctx.fillStyle = '#374151';
  ctx.font = '600 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Scan with Camera • No App Needed', width / 2, 1250);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Works on iPhone iOS & Android Google Lens', width / 2, 1296);

  // Footer branding
  ctx.fillStyle = '#6B7280';
  ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Powered by Menzo • Digital Menu Platform', width / 2, 1480);

  return canvas;
}

/**
 * Build canonical URL for a restaurant or table
 */
export function buildTableQRUrl(restaurantName = "The Food Club", tableNumber = null, baseUrl = window.location.origin) {
  const enc = encodeURIComponent(restaurantName);
  if (!tableNumber) return `${baseUrl}/menu.html?restaurant=${enc}`;
  return `${baseUrl}/menu.html?restaurant=${enc}&t=${encodeURIComponent(tableNumber)}`;
}

/**
 * Download canvas as PNG
 */
export function downloadCanvasPNG(canvas, filename = "menu-qr-code.png") {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

