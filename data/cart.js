(function () {
  var STORAGE_KEY = "astris-cart";

  function parsePrice(price) {
    return parseInt(String(price).replace(/\D/g, ""), 10) || 0;
  }

  function formatPrice(value) {
    return value.toLocaleString("ru-RU") + " ₽";
  }

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent("astris-cart-update", {
        detail: { items: items },
      })
    );
  }

  function getCount() {
    return readCart().reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  }

  function getTotal() {
    return readCart().reduce(function (sum, item) {
      return sum + item.priceValue * item.quantity;
    }, 0);
  }

  function addItem(product) {
    var items = readCart();
    var index = items.findIndex(function (item) {
      return item.slug === product.slug;
    });

    if (index >= 0) {
      items[index].quantity += 1;
    } else {
      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        priceValue: parsePrice(product.price),
        image: product.image,
        quantity: 1,
      });
    }

    writeCart(items);
    return items;
  }

  function removeItem(slug) {
    writeCart(
      readCart().filter(function (item) {
        return item.slug !== slug;
      })
    );
  }

  function updateQuantity(slug, quantity) {
    if (quantity <= 0) {
      removeItem(slug);
      return;
    }

    var items = readCart();
    var item = items.find(function (entry) {
      return entry.slug === slug;
    });
    if (!item) return;

    item.quantity = quantity;
    writeCart(items);
  }

  function siteRootPrefix() {
    var path = window.location.pathname;
    if (path.indexOf("/product/") !== -1) return "../../";
    if (path.indexOf("/catalog/") !== -1) return "../";
    if (path.indexOf("/legal/") !== -1) return "../../";
    if (path.indexOf("/checkout/") !== -1) return "../";
    return "";
  }

  function assetPrefix() {
    return siteRootPrefix();
  }

  function checkoutUrl() {
    return siteRootPrefix() + "checkout/";
  }

  function ensureCartPanel() {
    var existing = document.getElementById("cart-panel");
    if (existing) return existing;

    var panel = document.createElement("div");
    panel.id = "cart-panel";
    panel.className = "cart-drawer";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "cart-drawer-title");
    panel.innerHTML =
      '<div class="cart-drawer__backdrop" data-cart-close tabindex="-1" aria-hidden="true"></div>' +
      '<div class="cart-drawer__panel">' +
      '<button type="button" class="cart-drawer__close icon-btn" id="cart-close" aria-label="Закрыть корзину">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<path d="M6 6l12 12M18 6L6 18" />' +
      "</svg>" +
      "</button>" +
      '<h2 class="cart-drawer__title" id="cart-drawer-title">Корзина</h2>' +
      '<div class="cart-drawer__list" id="cart-list" role="list"></div>' +
      '<p class="cart-drawer__empty" id="cart-empty">Корзина пуста</p>' +
      '<div class="cart-drawer__footer" id="cart-footer" hidden>' +
      '<p class="cart-drawer__total"><span>Итого</span> <strong id="cart-total"></strong></p>' +
      '<button type="button" class="cart-drawer__checkout" id="cart-checkout">Оформить заказ</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(panel);
    return panel;
  }

  function renderCartList() {
    var list = document.getElementById("cart-list");
    var empty = document.getElementById("cart-empty");
    var footer = document.getElementById("cart-footer");
    var totalEl = document.getElementById("cart-total");
    if (!list || !empty || !footer || !totalEl) return;

    var items = readCart();
    var prefix = assetPrefix();

    list.innerHTML = "";
    if (!items.length) {
      empty.hidden = false;
      footer.hidden = true;
      return;
    }

    empty.hidden = true;
    footer.hidden = false;
    totalEl.textContent = formatPrice(getTotal());

    items.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "cart-item";
      row.setAttribute("role", "listitem");
      row.innerHTML =
        '<a class="cart-item__media" href="' +
        (prefix ? prefix + "product/" + item.slug + "/" : "product/" + item.slug + "/") +
        '">' +
        '<img src="' +
        prefix +
        item.image +
        '" alt="" width="80" height="120" loading="lazy" />' +
        "</a>" +
        '<div class="cart-item__body">' +
        '<a class="cart-item__name" href="' +
        (prefix ? prefix + "product/" + item.slug + "/" : "product/" + item.slug + "/") +
        '">' +
        item.name +
        "</a>" +
        '<p class="cart-item__price">' +
        item.price +
        "</p>" +
        '<div class="cart-item__qty">' +
        '<button type="button" class="cart-item__qty-btn" data-cart-qty="dec" data-slug="' +
        item.slug +
        '" aria-label="Уменьшить количество">−</button>' +
        '<span class="cart-item__qty-value">' +
        item.quantity +
        "</span>" +
        '<button type="button" class="cart-item__qty-btn" data-cart-qty="inc" data-slug="' +
        item.slug +
        '" aria-label="Увеличить количество">+</button>' +
        "</div>" +
        "</div>" +
        '<button type="button" class="cart-item__remove" data-cart-remove="' +
        item.slug +
        '" aria-label="Удалить из корзины">×</button>';

      list.appendChild(row);
    });
  }

  function updateBadge() {
    var badge = document.getElementById("cart-badge");
    if (!badge) return;

    var count = getCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  var untrap = null;

  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return function () {};

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    function onKeydown(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener("keydown", onKeydown);
    first.focus({ preventScroll: true });

    return function () {
      container.removeEventListener("keydown", onKeydown);
    };
  }

  function openCart() {
    var panel = ensureCartPanel();
    var openBtn = document.getElementById("cart-open");
    panel.hidden = false;
    document.body.style.overflow = "hidden";
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    renderCartList();
    untrap = trapFocus(panel.querySelector(".cart-drawer__panel") || panel);
  }

  function closeCart() {
    var panel = document.getElementById("cart-panel");
    var openBtn = document.getElementById("cart-open");
    if (!panel) return;

    panel.hidden = true;
    document.body.style.overflow = "";
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus({ preventScroll: true });
    }
    if (untrap) {
      untrap();
      untrap = null;
    }
  }

  function bindCartEvents() {
    var openBtn = document.getElementById("cart-open");
    if (openBtn && !openBtn.dataset.cartBound) {
      openBtn.dataset.cartBound = "1";
      openBtn.setAttribute("aria-controls", "cart-panel");
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.addEventListener("click", openCart);
    }

    document.addEventListener("click", function (e) {
      var target = e.target;

      if (target.closest("#cart-close") || target.closest("[data-cart-close]")) {
        closeCart();
        return;
      }

      var removeBtn = target.closest("[data-cart-remove]");
      if (removeBtn) {
        removeItem(removeBtn.getAttribute("data-cart-remove"));
        return;
      }

      var qtyBtn = target.closest("[data-cart-qty]");
      if (qtyBtn) {
        var slug = qtyBtn.getAttribute("data-slug");
        var action = qtyBtn.getAttribute("data-cart-qty");
        var item = readCart().find(function (entry) {
          return entry.slug === slug;
        });
        if (!item) return;
        updateQuantity(slug, action === "inc" ? item.quantity + 1 : item.quantity - 1);
        return;
      }

      var checkoutBtn = target.closest("#cart-checkout");
      if (checkoutBtn) {
        if (!readCart().length) return;
        window.location.href = checkoutUrl();
        return;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var panel = document.getElementById("cart-panel");
        if (panel && !panel.hidden) closeCart();
      }
    });
  }

  function initUI() {
    ensureCartPanel();
    bindCartEvents();
    updateBadge();
    renderCartList();
    window.addEventListener("astris-cart-update", function () {
      updateBadge();
      renderCartList();
    });
  }

  window.ASTRIS_CART = {
    addItem: addItem,
    removeItem: removeItem,
    updateQuantity: updateQuantity,
    getCount: getCount,
    getItems: readCart,
    getTotal: getTotal,
    open: openCart,
    initUI: initUI,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})();
