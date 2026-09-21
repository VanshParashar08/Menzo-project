import { getCurrentPlan, getCurrentPlanConfig, PLAN_TIERS, isFeatureAllowed } from './services/planService.js';
import { generateStyledQRCode, generatePrintStandCanvas, downloadCanvasPNG } from './utils/qrHelper.js';
import { FALLBACK_DEFAULT_IMAGE } from './services/imageProvider.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Sync restaurant name
  const savedRestName = localStorage.getItem('menzo_restaurant_name') || 'The Food Club';
  const restNameEl = document.getElementById('golive-rest-name');
  if (savedRestName && restNameEl) {
    restNameEl.textContent = savedRestName;
  }

  // 1.1 Sync Active Plan info cleanly
  const plan = getCurrentPlan();
  const setDescEl = document.querySelector('.set-desc');
  const setTitleEl = document.querySelector('.set-title');
  if (setDescEl && setTitleEl) {
    setTitleEl.textContent = "You're all set!";
    setDescEl.textContent = "Start sharing and let your customers explore your menu.";
  }

  // 2. Sync selected dishes from Step 3 into the phone mockup
  const savedDishesJson = localStorage.getItem('menzo_selected_dishes');
  const dishesListEl = document.getElementById('golive-dishes-list');

  if (dishesListEl) {
    let selectedDishes = [];
    if (savedDishesJson) {
      try {
        const parsed = JSON.parse(savedDishesJson);
        if (Array.isArray(parsed)) selectedDishes = parsed;
      } catch (e) {
        console.warn('Could not parse saved dishes:', e);
      }
    }

    function renderPhoneDishes(categoryFilter = 'All') {
      dishesListEl.innerHTML = '';
      if (selectedDishes.length === 0) {
        dishesListEl.innerHTML = `
          <div style="text-align: center; padding: 48px 12px; color: #9CA3AF;">
            <p style="font-size: 13.5px; font-weight: 700; color: #374151; margin: 0 0 4px;">No dishes added yet</p>
            <p style="font-size: 11px; margin: 0;">Add dishes in Step 3 to preview them here.</p>
          </div>
        `;
        return;
      }

      const filtered = categoryFilter === 'All' 
        ? selectedDishes 
        : selectedDishes.filter(d => (d.category || '').toLowerCase().includes(categoryFilter.toLowerCase()));

      const list = filtered.length > 0 ? filtered : selectedDishes;

      list.forEach(dish => {
        const item = document.createElement('div');
        item.className = 'golive-dish-item';
        item.innerHTML = `
          <img src="${dish.img || FALLBACK_DEFAULT_IMAGE}" alt="${dish.name}" class="golive-dish-thumb" onerror="this.onerror=null;this.src='${FALLBACK_DEFAULT_IMAGE}';" />
          <div class="golive-dish-info">
            <span class="golive-dish-name">${dish.name}</span>
            <span class="golive-dish-price">₹${dish.price}</span>
          </div>
          <span class="diet-icon ${dish.isVeg ? 'veg-icon' : 'non-veg-icon'} sm">
            ${dish.isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
          </span>
        `;
        dishesListEl.appendChild(item);
      });
    }

    renderPhoneDishes('All');

    // 3. Category chips switching inside phone
    const chips = document.querySelectorAll('.golive-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderPhoneDishes(chip.textContent.trim());
      });
    });
  }

  // 4. Toast notification helper
  const toast = document.getElementById('preview-toast');
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ============================================================
  // 5. LIVE QR CODE GENERATION (CRISP, SCANNABLE, VECTOR-QUALITY)
  // ============================================================
  const qrCanvas = document.getElementById('golive-qr-canvas');
  const restaurantSlug = (savedRestName || 'menzo').toLowerCase().replace(/\s+/g, '-');
  const liveMenuUrl = `${window.location.origin}/menu.html?restaurant=${encodeURIComponent(savedRestName)}`;

  if (qrCanvas) {
    await generateStyledQRCode(qrCanvas, liveMenuUrl, {
      fgColor: '#111820',
      bgColor: '#FFFFFF',
      size: 300,
      logo: 'menzo',
      showLogo: true
    });
  }

  // 6. Test Live Menu Button
  const btnTestLiveMenu = document.getElementById('btn-test-live-menu');
  if (btnTestLiveMenu) {
    btnTestLiveMenu.href = liveMenuUrl;
  }

  // 7. Download QR Code button
  const btnDownloadQr = document.getElementById('btn-download-qr');
  btnDownloadQr?.addEventListener('click', () => {
    if (!qrCanvas) {
      showToast('QR code is still rendering. Please wait a moment.');
      return;
    }
    downloadCanvasPNG(qrCanvas, `${restaurantSlug}-qr-code.png`);
    showToast('Ultra-crisp QR code downloaded successfully!');
  });

  // 8. Share on WhatsApp
  const btnWhatsapp = document.getElementById('btn-share-whatsapp');
  btnWhatsapp?.addEventListener('click', () => {
    const text = encodeURIComponent(`Explore our live contactless digital menu at ${savedRestName} on Menzo: ${liveMenuUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  // 9. Share on Instagram
  const btnInstagram = document.getElementById('btn-share-instagram');
  btnInstagram?.addEventListener('click', () => {
    navigator.clipboard?.writeText(liveMenuUrl).then(() => {
      showToast('Menu link copied! Paste in your Instagram story or bio.');
    }).catch(() => {
      showToast(`Menu link: ${liveMenuUrl}`);
    });
  });

  // 10. Copy Menu Link
  const btnCopyLink = document.getElementById('btn-copy-link');
  const copyLinkText = document.getElementById('copy-link-text');
  btnCopyLink?.addEventListener('click', () => {
    navigator.clipboard?.writeText(liveMenuUrl).then(() => {
      if (copyLinkText) copyLinkText.textContent = 'Copied!';
      showToast('Menu link copied to clipboard!');
      setTimeout(() => {
        if (copyLinkText) copyLinkText.textContent = 'Copy Menu Link';
      }, 2000);
    }).catch(() => {
      showToast(`Menu link: ${liveMenuUrl}`);
    });
  });

  // 11. Download for Print (Generates 300DPI Table Stand)
  const btnDownloadPrint = document.getElementById('btn-download-print');
  btnDownloadPrint?.addEventListener('click', async () => {
    showToast('Generating 300DPI print-ready table stand...');
    try {
      const standCanvas = await generatePrintStandCanvas({
        restaurantName: savedRestName,
        tableNumber: 'Table 01',
        targetUrl: liveMenuUrl
      });
      downloadCanvasPNG(standCanvas, `${restaurantSlug}-table-stand-print.png`);
      showToast('Print-ready 300DPI table stand downloaded!');
    } catch (e) {
      console.error('Error generating print stand:', e);
      if (qrCanvas) {
        downloadCanvasPNG(qrCanvas, `${restaurantSlug}-qr-code-print.png`);
      }
    }
  });
});
