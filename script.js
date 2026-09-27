(() => {
  'use strict';

  const STORAGE_KEY = 'olfact-bag-v1';
  const body = document.body;
  const drawer = document.querySelector('.bag-drawer');
  const drawerScrim = document.querySelector('[data-drawer-scrim]');
  const drawerItems = document.querySelector('[data-drawer-items]');
  const drawerFooter = document.querySelector('[data-drawer-footer]');
  const toast = document.querySelector('.toast');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileCloseButton = document.querySelector('.mobile-nav-close');
  let lastFocusedElement = null;
  let toastTimer;

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  function getBag() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  let bag = getBag();

  function saveBag() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
    } catch (error) {
      // The bag still works for this visit when storage is unavailable.
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function bagCount() {
    return bag.reduce((total, item) => total + item.quantity, 0);
  }

  function updateBagCount() {
    document.querySelectorAll('.bag-count').forEach((element) => {
      element.textContent = String(bagCount());
      element.setAttribute('aria-label', `${bagCount()} items in bag`);
    });
  }

  function safeText(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderBag() {
    updateBagCount();
    if (!drawerItems || !drawerFooter) return;

    if (bag.length === 0) {
      drawerItems.innerHTML = `
        <div class="drawer-empty">
          <span class="mark-icon" aria-hidden="true"></span>
          <p>Your bag is waiting for something memorable.</p>
          <a class="text-link" href="collection.html">Explore fragrances</a>
        </div>`;
      drawerFooter.innerHTML = '';
      return;
    }

    drawerItems.innerHTML = bag.map((item, index) => `
      <article class="drawer-item">
        <img class="drawer-item-image" src="${safeText(item.image)}" alt="${safeText(item.name)}">
        <div>
          <h3>${safeText(item.name)}</h3>
          <p>${safeText(item.size)}${item.quantity > 1 ? ` · Qty ${item.quantity}` : ''}</p>
          <button class="drawer-remove" type="button" data-remove-item="${index}">Remove</button>
        </div>
        <span class="drawer-item-price">${money.format(item.price * item.quantity)}</span>
      </article>`).join('');

    const total = bag.reduce((sum, item) => sum + item.price * item.quantity, 0);
    drawerFooter.innerHTML = `
      <div class="drawer-total"><span>Subtotal</span><span>${money.format(total)}</span></div>
      <button class="button button--ink" type="button" data-checkout>Proceed to checkout</button>
      <p class="drawer-note">Taxes calculated at checkout. Complimentary shipping over $150.</p>`;
  }

  function addItem(item) {
    const existing = bag.find((bagItem) => bagItem.name === item.name && bagItem.size === item.size);
    if (existing) {
      existing.quantity += 1;
    } else {
      bag.push({ ...item, quantity: 1 });
    }
    saveBag();
    renderBag();
    showToast(`${item.name} was added to your bag.`);
  }

  function removeItem(index) {
    const removed = bag[index];
    if (!removed) return;
    bag.splice(index, 1);
    saveBag();
    renderBag();
    showToast(`${removed.name} was removed.`);
  }

  function setBodyLock() {
    const overlayOpen = drawer?.classList.contains('is-open') || mobileNav?.classList.contains('is-open');
    body.classList.toggle('no-scroll', Boolean(overlayOpen));
  }

  function openDrawer() {
    if (!drawer || !drawerScrim) return;
    if (mobileNav?.classList.contains('is-open')) closeMobileNav(false);
    lastFocusedElement = document.activeElement;
    renderBag();
    drawer.classList.add('is-open');
    drawerScrim.classList.add('is-visible');
    drawer.setAttribute('aria-hidden', 'false');
    setBodyLock();
    window.setTimeout(() => drawer.querySelector('.drawer-close')?.focus(), 80);
  }

  function closeDrawer(restoreFocus = true) {
    if (!drawer || !drawerScrim) return;
    drawer.classList.remove('is-open');
    drawerScrim.classList.remove('is-visible');
    drawer.setAttribute('aria-hidden', 'true');
    setBodyLock();
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function openMobileNav() {
    if (!mobileNav || !mobileMenuButton) return;
    lastFocusedElement = document.activeElement;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    setBodyLock();
    window.setTimeout(() => mobileCloseButton?.focus(), 80);
  }

  function closeMobileNav(restoreFocus = true) {
    if (!mobileNav || !mobileMenuButton) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    setBodyLock();
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-to-bag]');
    if (addButton) {
      addItem({
        name: addButton.dataset.name,
        price: Number(addButton.dataset.price),
        image: addButton.dataset.image,
        size: addButton.dataset.size
      });
      return;
    }

    if (event.target.closest('.js-bag-open')) {
      openDrawer();
      return;
    }

    if (event.target.closest('.drawer-close') || event.target === drawerScrim) {
      closeDrawer();
      return;
    }

    const removeButton = event.target.closest('[data-remove-item]');
    if (removeButton) {
      removeItem(Number(removeButton.dataset.removeItem));
      return;
    }

    if (event.target.closest('[data-checkout]')) {
      showToast('Your bag is ready. Secure checkout can be connected when the store goes live.');
    }
  });

  mobileMenuButton?.addEventListener('click', openMobileNav);
  mobileCloseButton?.addEventListener('click', () => closeMobileNav());
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMobileNav(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (drawer?.classList.contains('is-open')) closeDrawer();
      else if (mobileNav?.classList.contains('is-open')) closeMobileNav();
    }

    if (event.key === 'Tab' && drawer?.classList.contains('is-open')) {
      const focusable = [...drawer.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Collection filters
  const filterButtons = document.querySelectorAll('[data-filter]');
  const collectionCards = document.querySelectorAll('.collection-products .product-card');
  const resultCount = document.querySelector('.result-count');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let visible = 0;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      collectionCards.forEach((card) => {
        const families = card.dataset.family.split(' ');
        const show = filter === 'all' || families.includes(filter);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'composition' : 'compositions'}`;
    });
  });

  // Personal discovery set builder
  const sampleOptions = [...document.querySelectorAll('[data-sample]')];
  const sampleStatus = document.querySelector('.sample-status');
  const sampleAddButton = document.querySelector('.sample-add-button');
  const selectedSamples = new Set();

  function renderSampleBuilder() {
    sampleOptions.forEach((option) => {
      const selected = selectedSamples.has(option.dataset.sample);
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
      const state = option.querySelector('.sample-option-state');
      if (state) state.textContent = selected ? 'Selected' : 'Choose';
    });

    if (sampleStatus) sampleStatus.textContent = `${selectedSamples.size} of 3 selected`;
    if (sampleAddButton) {
      const complete = selectedSamples.size === 3;
      sampleAddButton.disabled = !complete;
      sampleAddButton.textContent = complete ? 'Add your set — $24' : `Choose ${3 - selectedSamples.size} more`;
    }
  }

  sampleOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const sample = option.dataset.sample;
      if (selectedSamples.has(sample)) selectedSamples.delete(sample);
      else if (selectedSamples.size < 3) selectedSamples.add(sample);
      else showToast('Your discovery set holds three scents. Remove one to make a change.');
      renderSampleBuilder();
    });
  });

  sampleAddButton?.addEventListener('click', () => {
    if (selectedSamples.size !== 3) return;
    addItem({
      name: 'Personal Discovery Set',
      price: 24,
      image: 'assets/images/botanicals.jpg',
      size: [...selectedSamples].join(', ')
    });
    selectedSamples.clear();
    renderSampleBuilder();
  });

  // Newsletter confirmation
  document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const message = form.parentElement.querySelector('.form-message');
      if (!input?.checkValidity()) {
        input?.reportValidity();
        return;
      }
      if (message) message.textContent = 'Welcome to the Olfact journal. Your first letter is on its way.';
      form.reset();
    });
  });

  // Gentle in-view transitions
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  renderSampleBuilder();
  renderBag();
})();
