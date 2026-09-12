// ============================================================
// MENZO ONBOARDING STEP 2: CHOOSE PLAN JAVASCRIPT
// Handles plan selection, state persistence, and navigation to Step 3.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  let selectedPlan = 'pro'; // default as shown in reference

  const planCards = document.querySelectorAll('.onboarding-plan-card');
  const nextBtn = document.getElementById('btn-next-step');

  const updateSelectedUI = (plan) => {
    selectedPlan = plan;
    try {
      localStorage.setItem('menzo_selected_plan', plan);
    } catch (e) {}

    planCards.forEach(card => {
      const btn = card.querySelector('.plan-action-btn');
      const isCardPlan = btn?.dataset.plan === plan;

      if (isCardPlan) {
        card.classList.add('is-popular');
        card.setAttribute('aria-checked', 'true');
        btn?.classList.remove('btn-soft-slate');
        btn?.classList.add('btn-coral');
      } else {
        card.classList.remove('is-popular');
        card.setAttribute('aria-checked', 'false');
        btn?.classList.remove('btn-coral');
        btn?.classList.add('btn-soft-slate');
      }
    });

    // If Free is selected, adjust the ribbon or text if needed
    if (nextBtn) {
      nextBtn.innerHTML = `<span>Next: Set up Menu</span> <span class="btn-arrow">&rarr;</span>`;
    }
  };

  // Card click selection
  planCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const btn = card.querySelector('.plan-action-btn');
      const plan = btn?.dataset.plan || 'pro';
      updateSelectedUI(plan);

      // If clicked directly on the button, proceed to Step 3
      if (e.target.closest('.plan-action-btn')) {
        proceedToStep3();
      }
    });
  });

  const proceedToStep3 = () => {
    try {
      localStorage.setItem('menzo_selected_plan', selectedPlan);
    } catch (e) {}

    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span>Saving...</span>`;
    }

    setTimeout(() => {
      window.location.href = '/setup-menu.html';
    }, 250);
  };

  nextBtn?.addEventListener('click', proceedToStep3);
});
