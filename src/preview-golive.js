/**
 * Menzo Onboarding — Step 4: Preview & Go Live Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sync restaurant name
  const savedRestName = localStorage.getItem('menzo_restaurant_name');
  const restNameEl = document.getElementById('golive-rest-name');
  if (savedRestName && restNameEl) {
    restNameEl.textContent = savedRestName;
  }

  // 2. Sync selected dishes from Step 3
  const savedDishesJson = localStorage.getItem('menzo_selected_dishes');
  const dishesListEl = document.getElementById('golive-dishes-list');

  if (savedDishesJson && dishesListEl) {
    try {
      const selectedDishes = JSON.parse(savedDishesJson);
      if (Array.isArray(selectedDishes) && selectedDishes.length > 0) {
        function renderPhoneDishes(categoryFilter = 'All') {
          dishesListEl.innerHTML = '';
          const filtered = categoryFilter === 'All' 
            ? selectedDishes 
            : selectedDishes.filter(d => (d.category || '').toLowerCase().includes(categoryFilter.toLowerCase()));

          const list = filtered.length > 0 ? filtered : selectedDishes;

          list.forEach(dish => {
            const item = document.createElement('div');
            item.className = 'golive-dish-item';
            item.innerHTML = `
              <img src="${dish.img}" alt="${dish.name}" class="golive-dish-thumb" onerror="this.src='/images/paneer_tikka.jpg';" />
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
    } catch (e) {
      console.warn('Could not parse saved dishes:', e);
    }
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

  // 5. Download QR Code button
  const btnDownloadQr = document.getElementById('btn-download-qr');
  btnDownloadQr?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '/images/onboarding_menu_qr.png';
    link.download = `${(savedRestName || 'menzo').toLowerCase().replace(/\s+/g, '-')}-qr-menu.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR Code image downloaded successfully!');
  });

  // 6. Share on WhatsApp
  const btnWhatsapp = document.getElementById('btn-share-whatsapp');
  btnWhatsapp?.addEventListener('click', () => {
    const menuUrl = window.location.origin + '/menu';
    const text = encodeURIComponent(`Explore our live digital menu on Menzo: ${menuUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  // 7. Share on Instagram
  const btnInstagram = document.getElementById('btn-share-instagram');
  btnInstagram?.addEventListener('click', () => {
    const menuUrl = window.location.origin + '/menu';
    navigator.clipboard?.writeText(menuUrl).then(() => {
      showToast('Menu link copied! Paste in your Instagram story or bio link.');
    }).catch(() => {
      showToast('Add your menu link in your Instagram bio.');
    });
  });

  // 8. Copy Menu Link
  const btnCopyLink = document.getElementById('btn-copy-link');
  const copyLinkText = document.getElementById('copy-link-text');
  btnCopyLink?.addEventListener('click', () => {
    const menuUrl = window.location.origin + '/menu';
    navigator.clipboard?.writeText(menuUrl).then(() => {
      if (copyLinkText) copyLinkText.textContent = '✓ Copied!';
      showToast('Menu link copied to clipboard!');
      setTimeout(() => {
        if (copyLinkText) copyLinkText.textContent = 'Copy Menu Link';
      }, 2000);
    }).catch(() => {
      showToast('Menu link: ' + menuUrl);
    });
  });

  // 9. Download for Print
  const btnDownloadPrint = document.getElementById('btn-download-print');
  btnDownloadPrint?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '/images/onboarding_menu_qr.png';
    link.download = `${(savedRestName || 'menzo').toLowerCase().replace(/\s+/g, '-')}-table-stand-print.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Print-ready 300DPI QR asset downloaded!');
  });
});
