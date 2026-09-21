// ============================================================
// MENZO ONBOARDING STEP 2: CHOOSE PLAN JAVASCRIPT
// Handles plan selection, state persistence, trial modals,
// and navigation to Step 3.
// ============================================================

import confetti from 'canvas-confetti';
import { setPlan, PLAN_TIERS } from './services/planService.js';

document.addEventListener('DOMContentLoaded', () => {
  let selectedPlan = PLAN_TIERS.FREE;
  let hoveredPlan = null;
  let hasUserSelectedPlan = true;

  const planCards = document.querySelectorAll('.onboarding-plan-card');
  const nextBtn = document.getElementById('btn-next-step');

  const updateNextButtonText = () => {
    if (!nextBtn) return;
    nextBtn.innerHTML = `<span>Next: Set up Menu (Free)</span> <span class="btn-arrow">&rarr;</span>`;
  };

  const syncCardStyles = () => {
    planCards.forEach(card => {
      const btn = card.querySelector('.plan-action-btn');
      const cardPlan = btn?.dataset.plan;
      const isFree = cardPlan === PLAN_TIERS.FREE;

      if (isFree) {
        card.classList.add('is-popular', 'is-selected');
        card.setAttribute('aria-checked', 'true');
        btn?.classList.remove('btn-soft-slate');
        btn?.classList.add('btn-coral');
      } else {
        card.classList.remove('is-popular', 'is-selected');
        card.setAttribute('aria-checked', 'false');
        btn?.classList.remove('btn-coral');
        btn?.classList.add('btn-soft-slate');
      }
    });
  };

  // Card click behavior - only Free is active
  planCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const btn = card.querySelector('.plan-action-btn');
      const plan = btn?.dataset.plan;
      if (plan === PLAN_TIERS.PRO || plan === PLAN_TIERS.BUSINESS) {
        // Disabled Coming Soon tiers
        return;
      }
      selectedPlan = PLAN_TIERS.FREE;
      syncCardStyles();
      updateNextButtonText();

      if (e.target.closest('.plan-action-btn')) {
        handlePlanAction(PLAN_TIERS.FREE);
      }
    });
  });

  updateNextButtonText();
  syncCardStyles();

  // Next button click
  nextBtn?.addEventListener('click', () => {
    handlePlanAction(PLAN_TIERS.FREE);
  });

  function handlePlanAction() {
    setPlan(PLAN_TIERS.FREE, { isTrial: false });
    proceedToStep3('Setting up your Free account...');
  }

  function proceedToStep3(message = 'Saving plan...') {
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span>${message}</span>`;
    }

    setTimeout(() => {
      window.location.href = '/setup-menu.html';
    }, 450);
  }

  // ============================================================
  // PRO PLAN 14-DAY TRIAL / ACTIVATION MODAL
  // ============================================================
  function showProTrialModal() {
    const existing = document.getElementById('pro-trial-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pro-trial-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 32, 0.6);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 18px;
      animation: modalFadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopUp { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      </style>
      <div style="
        background: #FFFFFF;
        border-radius: 24px;
        width: 100%;
        max-width: 440px;
        padding: 32px 28px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif;
        position: relative;
        animation: modalPopUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
      ">
        <button type="button" id="modal-close-x" style="
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9CA3AF;
          line-height: 1;
        ">&times;</button>

        <div style="
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #FFF0EB;
          color: #F4512A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7z"/>
          </svg>
        </div>

        <div style="display: inline-block; background: #FFE8E0; color: #F4512A; font-size: 11.5px; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          14 Days Free Trial
        </div>

        <h3 style="font-size: 22px; font-weight: 800; color: #111820; margin: 0 0 6px;">Activate Menzo Pro</h3>
        <p style="font-size: 13.5px; color: #6B7280; margin: 0 0 20px; line-height: 1.45;">
          Unlock <strong>Live Table Order Management</strong>, remove all watermarks, and get custom QR codes with your restaurant logo.
        </p>

        <!-- Feature highlights box -->
        <div style="background: #FAF6F2; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; text-align: left; font-size: 13px; color: #374151; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4512A" stroke-width="2.8"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span><strong>Live Order Management</strong> with customer table cart</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4512A" stroke-width="2.8"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span><strong>100% Whitelabel</strong> (No Menzo branding on menu)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4512A" stroke-width="2.8"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Custom QR codes &amp; 5 premium themes</span>
          </div>
        </div>

        <!-- Action Button -->
        <button type="button" id="btn-activate-trial" style="
          width: 100%;
          height: 48px;
          background: #F4512A;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(244, 81, 42, 0.35);
          margin-bottom: 10px;
          transition: transform 0.15s ease;
        ">
          Start 14-Day Free Trial (₹0 Today)
        </button>

        <p style="font-size: 11.5px; color: #9CA3AF; margin: 0;">
          No credit card required. Cancel anytime. ₹499/mo after trial.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('#modal-close-x')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#btn-activate-trial')?.addEventListener('click', () => {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F4512A', '#FFA384', '#111820', '#22C55E']
        });
      } catch (e) {}

      setPlan(PLAN_TIERS.PRO, { isTrial: true });
      overlay.remove();
      proceedToStep3('Pro Plan Activated! Loading menu builder...');
    });
  }

  // ============================================================
  // BUSINESS PLAN MULTI-OUTLET SETUP MODAL
  // ============================================================
  function showBusinessSetupModal() {
    const existing = document.getElementById('business-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'business-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 32, 0.6);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 18px;
      animation: modalFadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFFFFF;
        border-radius: 24px;
        width: 100%;
        max-width: 440px;
        padding: 32px 28px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', system-ui, sans-serif;
        position: relative;
        text-align: center;
      ">
        <button type="button" id="b-modal-close-x" style="
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9CA3AF;
          line-height: 1;
        ">&times;</button>

        <div style="
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #E8F1FD;
          color: #1A73E8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l1.5-5h15L21 9v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2-2 2 2 0 0 1-2-2 2 2 0 0 1-2-2 2 2 0 0 1-2-2V9z"/>
            <path d="M5 13v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
            <path d="M9 22v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"/>
          </svg>
        </div>

        <div style="display: inline-block; background: #E8F1FD; color: #1A73E8; font-size: 11.5px; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-bottom: 8px; text-transform: uppercase;">
          Multi-Outlet Enterprise
        </div>

        <h3 style="font-size: 22px; font-weight: 800; color: #111820; margin: 0 0 6px;">Setup Your Restaurant Branches</h3>
        <p style="font-size: 13.5px; color: #6B7280; margin: 0 0 18px;">
          Includes <strong>Kitchen Display System (KDS)</strong>, multi-station routing (Kitchen &amp; Bar), and unlimited branch management.
        </p>

        <div style="text-align: left; margin-bottom: 18px;">
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: #374151; margin-bottom: 6px;">Primary Branch Name</label>
          <input type="text" id="input-branch-1" value="Main Outlet (Flagship)" style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13.5px; margin-bottom: 10px; box-sizing: border-box;" />

          <label style="display: block; font-size: 12.5px; font-weight: 700; color: #374151; margin-bottom: 6px;">Second Branch Name (Optional)</label>
          <input type="text" id="input-branch-2" placeholder="e.g. Downtown Outlet / Express" style="width: 100%; height: 38px; padding: 0 12px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13.5px; box-sizing: border-box;" />
        </div>

        <button type="button" id="btn-activate-business" style="
          width: 100%;
          height: 48px;
          background: #111820;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 10px;
        ">
          Activate Business Plan (₹1,499/mo)
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('#b-modal-close-x')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#btn-activate-business')?.addEventListener('click', () => {
      const b1 = overlay.querySelector('#input-branch-1')?.value.trim() || 'Main Outlet';
      const b2 = overlay.querySelector('#input-branch-2')?.value.trim();
      const branches = [b1];
      if (b2) branches.push(b2);

      setPlan(PLAN_TIERS.BUSINESS, { branches, isTrial: true });
      overlay.remove();
      proceedToStep3('Business Enterprise Configured! Loading...');
    });
  }
});
