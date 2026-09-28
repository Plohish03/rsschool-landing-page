(function () {
  var MOBILE_LIMIT = 4;
  var mobile = window.matchMedia('(max-width: 768px)');

  var tabsEl = document.querySelector('.menu__tabs');
  var cardsEl = document.getElementById('menu-cards');
  var moreBtn = document.getElementById('menu-show-more');
  if (!tabsEl || !cardsEl || !moreBtn) return;

  var products = window.PRODUCTS || [];
  var category = '';
  var expanded = false;
  var modal = null;
  var lastFocused = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function cents(value) { return Math.round(parseFloat(value) * 100); }
  function money(c) { return '$' + (c / 100).toFixed(2); }

  // "Irish coffee" -> img/menu/irish-coffee.jpg
  function imageOf(p) {
    var slug = p.name.toLowerCase().trim().replace(/\s+/g, '-');
    return p.image || 'img/menu/' + slug + '.jpg';
  }

  /* ---------- catalog ---------- */

  function categoryProducts() {
    return products.filter(function (p) { return p.category === category; });
  }

  function createCard(p, id) {
    var card = el('div', 'cards__item');
    card.dataset.id = id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    var imgWrap = el('div', 'cards__img');
    var img = el('img');
    img.src = imageOf(p);
    img.alt = p.name;
    imgWrap.appendChild(img);

    var descr = el('div', 'cards__descr');
    descr.appendChild(el('h3', 'cards__name', p.name));
    descr.appendChild(el('p', '', p.description));
    descr.appendChild(el('span', 'cards__price', money(cents(p.price))));

    card.appendChild(imgWrap);
    card.appendChild(descr);
    return card;
  }

  function render() {
    var list = categoryProducts();
    var limited = mobile.matches && !expanded && list.length > MOBILE_LIMIT;
    var visible = limited ? list.slice(0, MOBILE_LIMIT) : list;

    var fragment = document.createDocumentFragment();
    visible.forEach(function (p) {
      fragment.appendChild(createCard(p, products.indexOf(p)));
    });
    cardsEl.replaceChildren(fragment);
    moreBtn.hidden = !limited;
  }

  function setCategory(name) {
    category = name;
    expanded = false;
    tabsEl.querySelectorAll('.tabs__item').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.tabId === name);
    });
    render();
  }

  tabsEl.addEventListener('click', function (e) {
    var tab = e.target.closest('.tabs__item');
    if (tab) setCategory(tab.dataset.tabId);
  });

  tabsEl.querySelectorAll('.tabs__item').forEach(function (tab) {
    tab.tabIndex = 0;
    tab.setAttribute('role', 'button');
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setCategory(tab.dataset.tabId);
      }
    });
  });

  moreBtn.addEventListener('click', function () {
    expanded = true;
    render();
  });

  mobile.addEventListener('change', function () {
    expanded = false;
    render();
  });

  /* ---------- modal ---------- */

  function openModal(p, imageSrc) {
    closeModal();
    lastFocused = document.activeElement;

    var sizeKeys = Object.keys(p.sizes || {});
    var state = { size: sizeKeys[0], additives: {} };

    var overlay = el('div', 'modal');
    var container = el('div', 'modal__container');
    var card = el('div', 'modal__card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', p.name);

    var imgWrap = el('div', 'm-card__img');
    var img = el('img');
    img.src = imageSrc;
    img.alt = p.name;
    imgWrap.appendChild(img);

    var info = el('div', 'm-card__info');
    var head = el('div');
    head.appendChild(el('h3', 'm-card__name', p.name));
    head.appendChild(el('p', 'm-card__descr', p.description));
    info.appendChild(head);

    var totalPrice = el('span', 'm-card__total-price');

    function updateTotal() {
      var sum = cents(p.price);
      if (state.size) sum += cents(p.sizes[state.size]['add-price']);
      Object.keys(state.additives).forEach(function (i) {
        if (state.additives[i]) sum += cents(p.additives[i]['add-price']);
      });
      totalPrice.textContent = money(sum);
    }

    function option(icon, name) {
      var btn = el('button', 'option');
      btn.type = 'button';
      btn.appendChild(el('span', 'option__icon', icon));
      btn.appendChild(el('span', 'option__name', name));
      return btn;
    }

    function group(title) {
      var box = el('div', 'm-card__group');
      box.appendChild(el('p', 'm-card__group-title', title));
      var list = el('div', 'm-card__options');
      box.appendChild(list);
      info.appendChild(box);
      return list;
    }

    if (sizeKeys.length) {
      var sizeList = group('Size');
      var sizeBtns = {};
      sizeKeys.forEach(function (key) {
        var btn = option(key.toUpperCase(), p.sizes[key].size);
        btn.classList.add('option--size');
        btn.classList.toggle('active', key === state.size);
        btn.addEventListener('click', function () {
          state.size = key;
          sizeKeys.forEach(function (k) {
            sizeBtns[k].classList.toggle('active', k === key);
          });
          updateTotal();
        });
        sizeBtns[key] = btn;
        sizeList.appendChild(btn);
      });
    }

    if (p.additives && p.additives.length) {
      var addList = group('Additives');
      p.additives.forEach(function (a, i) {
        var btn = option(String(i + 1), a.name);
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', function () {
          state.additives[i] = !state.additives[i];
          btn.classList.toggle('active', state.additives[i]);
          btn.setAttribute('aria-pressed', String(state.additives[i]));
          updateTotal();
        });
        addList.appendChild(btn);
      });
    }

    var total = el('div', 'm-card__total');
    total.appendChild(el('span', 'm-card__total-name', 'Total:'));
    total.appendChild(totalPrice);
    info.appendChild(total);

    var alert = el('div', 'm-card__alert');
    alert.innerHTML = '<svg class="m-card__alert-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4M8 5h.01"/></svg>';
    alert.appendChild(el('span', 'm-card__alert-text',
      'The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.'));
    info.appendChild(alert);

    var closeBtn = el('button', 'm-card__btn', 'Close');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', closeModal);
    info.appendChild(closeBtn);

    card.appendChild(imgWrap);
    card.appendChild(info);
    container.appendChild(card);
    overlay.appendChild(container);

    container.addEventListener('click', function (e) {
      if (e.target === container) closeModal();
    });

    updateTotal();
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    modal = overlay;
    closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.remove();
    modal = null;
    document.body.classList.remove('modal-open');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  function openFromCard(card) {
    var p = products[card.dataset.id];
    var img = card.querySelector('img');
    if (p) openModal(p, img ? img.getAttribute('src') : imageOf(p));
  }

  cardsEl.addEventListener('click', function (e) {
    var card = e.target.closest('.cards__item');
    if (card) openFromCard(card);
  });

  cardsEl.addEventListener('keydown', function (e) {
    var card = e.target.closest('.cards__item');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openFromCard(card);
    }
  });

  /* ---------- init ---------- */

  if (!products.length) {
    cardsEl.textContent = 'Menu data is not available.';
    return;
  }
  
  setCategory(tabsEl.querySelector('.tabs__item').dataset.tabId);
})();
