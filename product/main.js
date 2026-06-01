(function () {
  function getSlugFromPath() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var parts = path.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function displayName(product) {
    if (product.shortName) return product.shortName;
    return product.name
      .replace(/^Кольцо\s+/i, "")
      .replace(/^Подвеска\s+/i, "");
  }

  function parseSizes(product) {
    if (product.sizes && product.sizes.length) return product.sizes;
    if (!product.size) return null;
    var range = String(product.size).match(/(\d{2})\s*[-–]\s*(\d{2})/);
    if (!range) return null;
    var from = parseInt(range[1], 10);
    var to = parseInt(range[2], 10);
    var list = [];
    for (var n = from; n <= to; n++) list.push(n);
    return list;
  }

  function buildMeta(product) {
    var items = [];
    var material = product.material || product.materials;
    if (material) items.push(["Материал", material]);
    if (product.edition) items.push(["Тираж", product.edition]);
    return items;
  }

  function buildSlides(product) {
    var slides = [];
    if (product.image) {
      slides.push({
        type: "image",
        src: product.image,
        alt: product.name,
        primary: true,
      });
    }
    (product.gallery || []).forEach(function (src) {
      slides.push({
        type: "image",
        src: src,
        alt: product.name + " — на модели",
        lifestyle: true,
      });
    });
    if (product.video) {
      slides.push({
        type: "video",
        src: product.video,
        label: product.name,
      });
    }
    return slides;
  }

  var products = window.PRODUCTS || [];
  var slug = getSlugFromPath();
  var product = products.find(function (p) {
    return p.slug === slug;
  });

  var titleEl = document.querySelector(".product-detail-title");
  var priceEl = document.querySelector(".product-detail-price");
  var descEl = document.querySelector(".product-detail-description");
  var buttonEl = document.querySelector(".product-detail-button");
  var metaEl = document.getElementById("product-detail-meta");
  var sizesWrap = document.getElementById("product-detail-sizes");
  var sizesList = document.getElementById("product-detail-sizes-list");
  var stageEl = document.getElementById("product-detail-stage");
  var thumbsEl = document.getElementById("product-detail-thumbs");

  if (!product) {
    text(titleEl, "Товар не найден");
    text(descEl, "Проверьте ссылку или вернитесь в каталог.");
    if (metaEl) metaEl.innerHTML = "";
    if (buttonEl) buttonEl.style.display = "none";
    if (sizesWrap) sizesWrap.hidden = true;
    if (thumbsEl) thumbsEl.hidden = true;
    document.title = "Товар не найден — ASTRIS";
    return;
  }

  document.body.classList.add("product-page");

  text(titleEl, displayName(product));
  text(priceEl, product.price);
  text(descEl, product.description || "");
  text(buttonEl, "ДОБАВИТЬ В КОРЗИНУ — " + product.price);
  document.title = product.name + " — ASTRIS";

  initMeta(product);
  initSizes(product);
  initProductMedia(product);

  function initMeta(product) {
    if (!metaEl) return;
    var items = buildMeta(product);
    metaEl.innerHTML = "";
    items.forEach(function (row) {
      var wrap = document.createElement("div");
      wrap.className = "product-detail-meta__item";
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = row[0];
      dd.textContent = row[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      metaEl.appendChild(wrap);
    });
  }

  function initSizes(product) {
    if (!sizesWrap || !sizesList) return;
    var sizes = parseSizes(product);
    if (!sizes || !sizes.length) {
      sizesWrap.hidden = true;
      return;
    }
    sizesWrap.hidden = false;
    sizesList.innerHTML = "";
    var active = product.defaultSize || sizes[Math.floor(sizes.length / 2)];

    sizes.forEach(function (size) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "product-detail-size";
      if (size === active) btn.classList.add("is-active");
      btn.textContent = String(size);
      btn.setAttribute("aria-pressed", size === active ? "true" : "false");
      btn.addEventListener("click", function () {
        sizesList.querySelectorAll(".product-detail-size").forEach(function (el) {
          el.classList.remove("is-active");
          el.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      });
      sizesList.appendChild(btn);
    });
  }

  function initProductMedia(product) {
    if (!stageEl) return;

    var slides = buildSlides(product);
    if (!slides.length) return;

    var activeVideo = null;
    var videoSlideIndex = -1;
    slides.forEach(function (s, i) {
      if (s.type === "video") videoSlideIndex = i;
    });

    function pauseVideo() {
      if (activeVideo) {
        activeVideo.pause();
        activeVideo = null;
      }
    }

    function renderStage(index) {
      var slide = slides[index];
      pauseVideo();
      stageEl.innerHTML = "";
      stageEl.className = "product-detail-stage";

      if (slide.type === "video") {
        stageEl.classList.add("is-video");
        var blend = document.createElement("div");
        blend.className = "product-detail-stage__video-blend";
        var video = document.createElement("video");
        video.className = "product-detail-video";
        video.src = "../../" + slide.src;
        if (/\.mov$/i.test(slide.src)) {
          video.setAttribute("type", "video/quicktime");
        }
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("preload", "auto");
        video.setAttribute("aria-label", slide.label);
        blend.appendChild(video);
        stageEl.appendChild(blend);
        activeVideo = video;
        video.play().catch(function () {});
        return;
      }

      if (slide.primary) stageEl.classList.add("is-primary");
      if (slide.lifestyle) stageEl.classList.add("is-lifestyle");

      var img = document.createElement("img");
      img.className = "product-detail-stage__img";
      img.src = "../../" + slide.src;
      img.alt = slide.alt;
      img.decoding = "async";
      stageEl.appendChild(img);
    }

    function setActiveThumb(index) {
      if (!thumbsEl) return;
      thumbsEl.querySelectorAll(".product-detail-thumb").forEach(function (btn, i) {
        var on = i === index;
        btn.classList.toggle("product-detail-thumb--active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function goTo(index) {
      if (index < 0 || index >= slides.length) return;
      renderStage(index);
      setActiveThumb(index);
    }

    if (slides.length > 1 && thumbsEl) {
      thumbsEl.hidden = false;
      thumbsEl.innerHTML = "";

      slides.forEach(function (slide, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "product-detail-thumb";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", index === 0 ? "true" : "false");

        var thumbImg = document.createElement("img");
        thumbImg.alt = "";
        thumbImg.loading = "lazy";
        if (slide.type === "video") {
          btn.classList.add("product-detail-thumb--video");
          thumbImg.src = "../../" + product.image;
        } else {
          thumbImg.src = "../../" + slide.src;
        }
        btn.appendChild(thumbImg);
        btn.addEventListener("click", function () {
          goTo(index);
        });
        thumbsEl.appendChild(btn);
      });
    } else if (thumbsEl) {
      thumbsEl.hidden = true;
    }

    goTo(0);
  }

  if (buttonEl && window.ASTRIS_CART) {
    buttonEl.addEventListener("click", function () {
      window.ASTRIS_CART.addItem(product);
      var label = "ДОБАВИТЬ В КОРЗИНУ — " + product.price;
      buttonEl.textContent = "ДОБАВЛЕНО В КОРЗИНУ";
      buttonEl.classList.add("product-detail-button--added");
      window.setTimeout(function () {
        buttonEl.textContent = label;
        buttonEl.classList.remove("product-detail-button--added");
      }, 1800);
    });
  }
})();
