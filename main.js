(function () {
  var header = document.getElementById("site-header");
  var menu = document.getElementById("site-menu");
  var openBtn = document.getElementById("menu-open");
  var closeBtn = document.getElementById("menu-close");
  var sections = document.querySelectorAll("[data-header]");

  function setHeaderTheme(light) {
    if (!header) return;
    header.classList.toggle("is-on-light", light);
  }

  function updateHeaderFromScroll() {
    var y = window.scrollY + header.offsetHeight * 0.5;
    var onLight = false;
    sections.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var bottom = top + rect.height;
      if (y >= top && y < bottom) {
        onLight = el.getAttribute("data-header") === "light";
      }
    });
    setHeaderTheme(onLight);
  }

  window.addEventListener("scroll", updateHeaderFromScroll, { passive: true });
  window.addEventListener("resize", updateHeaderFromScroll);
  updateHeaderFromScroll();

  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
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

  var untrap = null;

  function openMenu() {
    if (!menu || !openBtn) return;
    menu.hidden = false;
    document.body.style.overflow = "hidden";
    openBtn.setAttribute("aria-expanded", "true");
    untrap = trapFocus(menu);
  }

  function closeMenu() {
    if (!menu || !openBtn) return;
    menu.hidden = true;
    document.body.style.overflow = "";
    openBtn.setAttribute("aria-expanded", "false");
    if (untrap) {
      untrap();
      untrap = null;
    }
    openBtn.focus({ preventScroll: true });
  }

  if (openBtn && menu) {
    openBtn.addEventListener("click", openMenu);
  }
  if (closeBtn && menu) {
    closeBtn.addEventListener("click", closeMenu);
  }
  if (menu) {
    menu.addEventListener("click", function (e) {
      if (e.target === menu) closeMenu();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && !menu.hidden) {
      closeMenu();
    }
  });

  function initPackagingCarousel() {
    var root = document.getElementById("packaging-carousel");
    if (!root) return;
    var viewport = root.querySelector(".packaging-carousel__viewport");
    var track = root.querySelector(".packaging-carousel__track");
    var slides = root.querySelectorAll(".packaging-carousel__slide");
    var prevBtn = root.querySelector(".packaging-carousel__btn--prev");
    var nextBtn = root.querySelector(".packaging-carousel__btn--next");
    var dotsRoot = root.querySelector(".packaging-carousel__dots");
    var n = slides.length;
    if (!viewport || !track || n === 0) return;

    var index = 0;
    var touchStartX = null;

    function layoutSlides() {
      var w = viewport.getBoundingClientRect().width;
      if (!w) return;
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.flex = "0 0 " + w + "px";
        slides[i].style.width = w + "px";
        slides[i].style.minWidth = w + "px";
        slides[i].style.maxWidth = w + "px";
      }
      track.style.width = w * n + "px";
    }

    function goTo(i) {
      if (i < 0) i = 0;
      if (i >= n) i = n - 1;
      index = i;
      layoutSlides();
      var w = viewport.getBoundingClientRect().width || viewport.offsetWidth;
      track.style.transform = "translateX(" + -index * w + "px)";
      updateDots();
      updateButtons();
    }

    function updateButtons() {
      var atStart = index === 0;
      var atEnd = index >= n - 1;
      if (prevBtn) {
        prevBtn.disabled = atStart;
        prevBtn.setAttribute("aria-disabled", atStart ? "true" : "false");
        prevBtn.style.opacity = atStart ? "0.28" : "";
      }
      if (nextBtn) {
        nextBtn.disabled = atEnd;
        nextBtn.setAttribute("aria-disabled", atEnd ? "true" : "false");
        nextBtn.style.opacity = atEnd ? "0.28" : "";
      }
    }

    function updateDots() {
      if (!dotsRoot) return;
      var dots = dotsRoot.querySelectorAll(".packaging-carousel__dot");
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("packaging-carousel__dot--active", i === index);
        dots[i].setAttribute("aria-selected", i === index ? "true" : "false");
      }
    }

    function buildDots() {
      if (!dotsRoot) return;
      dotsRoot.innerHTML = "";
      for (var d = 0; d < n; d++) {
        (function (j) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "packaging-carousel__dot";
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", "Слайд " + (j + 1));
          b.setAttribute("aria-selected", j === 0 ? "true" : "false");
          if (j === 0) b.classList.add("packaging-carousel__dot--active");
          b.addEventListener("click", function () {
            goTo(j);
          });
          dotsRoot.appendChild(b);
        })(d);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    viewport.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX == null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        var cur = index;
        if (dx < -48) goTo(cur + 1);
        else if (dx > 48) goTo(cur - 1);
      },
      { passive: true }
    );

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      }
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        goTo(index);
      }, 100);
    });

    buildDots();
    layoutSlides();
    goTo(0);

    window.addEventListener("load", function () {
      layoutSlides();
      goTo(index);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPackagingCarousel);
  } else {
    initPackagingCarousel();
  }

  var CATALOG_ASSET_VERSION = "75";

  function productCategoryLabel(product) {
    if (product.category) return product.category;
    var label = product.material || product.materials || "Серебро 925";
    if (product.stone) label += " · " + product.stone.toLowerCase();
    return label;
  }

  function buildProductCard(product, assetPrefix) {
    var prefix = assetPrefix || "";
    var article = document.createElement("article");
    article.className = "product-card product-card--" + product.slug;

    var mediaLink = document.createElement("a");
    mediaLink.className = "product-card__media";
    mediaLink.href = prefix + "product/" + product.slug + "/";

    var img = document.createElement("img");
    img.className = "product-card__img";
    img.src = prefix + product.image + "?v=" + CATALOG_ASSET_VERSION;
    img.alt = product.imageAlt || product.name;
    img.width = 687;
    img.height = 1024;
    img.loading = "lazy";
    mediaLink.appendChild(img);

    var meta = document.createElement("div");
    meta.className = "product-card__meta";

    var title = document.createElement("h3");
    title.className = "product-card__name";
    var titleLink = document.createElement("a");
    titleLink.href = prefix + "product/" + product.slug + "/";
    titleLink.textContent = product.name;
    title.appendChild(titleLink);

    var cat = document.createElement("p");
    cat.className = "product-card__cat";
    cat.textContent = productCategoryLabel(product);

    var price = document.createElement("p");
    price.className = "product-card__price";
    price.textContent = product.price;

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "product-card__add";
    addBtn.setAttribute("data-add-to-cart", product.slug);
    addBtn.textContent = "Добавить в корзину";

    meta.appendChild(title);
    meta.appendChild(cat);
    meta.appendChild(price);
    meta.appendChild(addBtn);

    article.appendChild(mediaLink);
    article.appendChild(meta);
    return article;
  }

  function renderProductGrid(container, products, assetPrefix) {
    if (!container || !products) return;
    container.innerHTML = "";
    products.forEach(function (product) {
      container.appendChild(buildProductCard(product, assetPrefix));
    });
    initCatalogAddButtons(container);
  }

  function initFullCatalogPage() {
    var grid = document.getElementById("catalog-grid");
    if (!grid || !window.PRODUCTS) return;
    renderProductGrid(grid, window.PRODUCTS, "../");
    document.title = "Каталог — ASTRIS";
  }

  function initCatalogAddButtons(root) {
    if (!window.ASTRIS_CART || !window.PRODUCTS) return;

    var scope = root || document;
    scope.querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = "1";

      var slug = btn.getAttribute("data-add-to-cart");
      var product = window.PRODUCTS.find(function (entry) {
        return entry.slug === slug;
      });
      if (!product) return;

      btn.addEventListener("click", function () {
        window.ASTRIS_CART.addItem(product);
        btn.textContent = "Добавлено";
        btn.classList.add("product-card__add--added");
        window.setTimeout(function () {
        btn.textContent = "Добавить в корзину";
        btn.classList.remove("product-card__add--added");
        }, 1800);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initCatalogAddButtons();
      initFullCatalogPage();
    });
  } else {
    initCatalogAddButtons();
    initFullCatalogPage();
  }
})();
