(function () {
  function getSlugFromPath() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var parts = path.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function buildSpecs(product) {
    var rows = [];
    var material = product.material || product.materials;
    if (material) rows.push(["Материал", material]);
    if (product.stone) rows.push(["Камень", product.stone]);
    if (product.edition) rows.push(["Тираж", product.edition]);
    if (product.size) rows.push(["Размер", product.size]);
    return rows;
  }

  var products = window.PRODUCTS || [];
  var slug = getSlugFromPath();
  var product = products.find(function (p) {
    return p.slug === slug;
  });

  if (!product) {
    var title = document.querySelector(".product-detail-title");
    var desc = document.querySelector(".product-detail-description");
    text(title, "Товар не найден");
    text(desc, "Проверьте ссылку или вернитесь в каталог.");
    var specs = document.querySelector(".product-detail-specs");
    if (specs) specs.innerHTML = "";
    var button = document.querySelector(".product-detail-button");
    if (button) button.style.display = "none";
    document.title = "Товар не найден — ASTRIS";
    return;
  }

  var image = document.querySelector(".product-detail-image");
  var titleEl = document.querySelector(".product-detail-title");
  var descEl = document.querySelector(".product-detail-description");
  var buttonEl = document.querySelector(".product-detail-button");
  var specsEl = document.querySelector(".product-detail-specs");

  if (image) {
    image.src = "../../" + product.image;
    image.alt = product.name;
  }

  if (product.video && image) {
    var media = image.closest(".product-detail-media");
    if (media) {
      media.classList.add("product-detail-media--has-video");

      var video = document.createElement("video");
      video.className = "product-detail-video";
      video.src = "../../" + product.video;
      if (/\.mov$/i.test(product.video)) {
        video.setAttribute("type", "video/quicktime");
      }
      video.poster = "../../" + product.image;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("preload", "auto");
      video.setAttribute("aria-label", product.name);
      media.appendChild(video);

      image.setAttribute("aria-hidden", "true");
      video.play().catch(function () {});
    }
  }

  text(titleEl, product.name);
  text(descEl, product.description || "");
  text(buttonEl, "ДОБАВИТЬ В КОРЗИНУ — " + product.price);
  document.title = product.name + " — ASTRIS";

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

  if (specsEl) {
    var rows = buildSpecs(product);
    specsEl.innerHTML = "";
    rows.forEach(function (row) {
      var wrap = document.createElement("div");
      wrap.className = "product-detail-spec-row";
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = row[0];
      dd.textContent = row[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      specsEl.appendChild(wrap);
    });
  }
})();
