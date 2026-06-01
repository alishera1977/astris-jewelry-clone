(function () {
  function getSlugFromPath() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var parts = path.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  var PAGE_BG = [249, 248, 246];

  function colorDist(a, b) {
    var dr = a[0] - b[0];
    var dg = a[1] - b[1];
    var db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function colorSpread(rgb) {
    return Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]);
  }

  function isFaithVideoBackground(rgb, cornerAvg) {
    var lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    var spread = colorSpread(rgb);
    if (colorDist(rgb, cornerAvg) <= 52) return true;
    if (lum <= 40 && spread < 28) return true;
    if (lum >= 188 && spread < 34) return true;
    return false;
  }

  function buildFaithVideoMask(data, width, height) {
    var corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [width >> 1, 0],
      [width >> 1, height - 1],
    ];
    var cornerAvg = [0, 0, 0];
    corners.forEach(function (pt) {
      var i = (pt[1] * width + pt[0]) * 4;
      cornerAvg[0] += data[i];
      cornerAvg[1] += data[i + 1];
      cornerAvg[2] += data[i + 2];
    });
    cornerAvg[0] = Math.round(cornerAvg[0] / corners.length);
    cornerAvg[1] = Math.round(cornerAvg[1] / corners.length);
    cornerAvg[2] = Math.round(cornerAvg[2] / corners.length);

    var visited = new Uint8Array(width * height);
    var queue = [];

    function tryPush(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      var idx = y * width + x;
      if (visited[idx]) return;
      var i = idx * 4;
      var rgb = [data[i], data[i + 1], data[i + 2]];
      if (!isFaithVideoBackground(rgb, cornerAvg)) return;
      visited[idx] = 1;
      queue.push(idx);
    }

    for (var x = 0; x < width; x++) {
      tryPush(x, 0);
      tryPush(x, height - 1);
    }
    for (var y = 0; y < height; y++) {
      tryPush(0, y);
      tryPush(width - 1, y);
    }

    var head = 0;
    while (head < queue.length) {
      var idx = queue[head++];
      var px = idx % width;
      var py = (idx / width) | 0;
      tryPush(px - 1, py);
      tryPush(px + 1, py);
      tryPush(px, py - 1);
      tryPush(px, py + 1);
    }

    for (var i = 0; i < width * height; i++) {
      if (visited[i]) continue;
      var p = i * 4;
      var rgb = [data[p], data[p + 1], data[p + 2]];
      var lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
      if (lum >= 205 && colorSpread(rgb) < 18) visited[i] = 1;
    }

    return visited;
  }

  function paintFaithVideoFrame(video, canvas, mask) {
    if (!video.videoWidth || !mask) return;
    var w = video.videoWidth;
    var h = video.videoHeight;
    if (canvas.width !== w) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);
    var frame = ctx.getImageData(0, 0, w, h);
    var data = frame.data;
    for (var idx = 0; idx < mask.length; idx++) {
      if (!mask[idx]) continue;
      var i = idx * 4;
      data[i] = PAGE_BG[0];
      data[i + 1] = PAGE_BG[1];
      data[i + 2] = PAGE_BG[2];
      data[i + 3] = 255;
    }
    ctx.putImageData(frame, 0, 0);
  }

  function setupFaithVideoBackground(video, blend) {
    var canvas = document.createElement("canvas");
    canvas.className = "product-detail-video product-detail-video--faith-canvas";
    canvas.setAttribute("aria-hidden", "true");
    blend.insertBefore(canvas, video);
    video.classList.add("product-detail-video--faith-src");

    var mask = null;
    var rafId = 0;
    var probe = document.createElement("canvas");
    var probeCtx = probe.getContext("2d", { willReadFrequently: true });

    function ensureMask() {
      if (mask || !video.videoWidth) return;
      probe.width = video.videoWidth;
      probe.height = video.videoHeight;
      probeCtx.drawImage(video, 0, 0);
      var frame = probeCtx.getImageData(0, 0, probe.width, probe.height);
      mask = buildFaithVideoMask(frame.data, probe.width, probe.height);
    }

    function tick() {
      rafId = 0;
      ensureMask();
      paintFaithVideoFrame(video, canvas, mask);
      if (!video.paused && !video.ended) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    function schedule() {
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    }

    video.addEventListener("loadeddata", schedule);
    video.addEventListener("play", schedule);
    video.addEventListener("seeked", schedule);
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

  var titleEl = document.querySelector(".product-detail-title");
  var descEl = document.querySelector(".product-detail-description");
  var buttonEl = document.querySelector(".product-detail-button");
  var specsEl = document.querySelector(".product-detail-specs");

  if (product.slug === "faith-signet") {
    var page = document.querySelector(".product-detail-page");
    if (page) page.classList.add("product-detail-page--faith-signet");
  }

  initProductMedia(product);

  function initProductMedia(product) {
    var media = document.querySelector(".product-detail-media");
    if (!media) return;

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

    if (!slides.length) return;

    if (slides.length === 1 && slides[0].type === "image") {
      var loneImage = document.querySelector(".product-detail-image");
      if (loneImage) {
        loneImage.src = "../../" + slides[0].src;
        loneImage.alt = slides[0].alt;
      }
      return;
    }

    media.classList.add("product-detail-media--gallery");
    media.setAttribute("aria-label", "Фото и видео изделия");
    media.innerHTML = "";

    var gallery = document.createElement("div");
    gallery.className = "product-detail-gallery";

    var track = document.createElement("div");
    track.className = "product-detail-gallery__track";
    track.setAttribute("tabindex", "0");

    var videos = [];
    var videoSlideIndex = -1;

    slides.forEach(function (slide, index) {
      var item = document.createElement("div");
      item.className = "product-detail-gallery__slide";
      if (slide.primary) {
        item.classList.add("product-detail-gallery__slide--primary");
      }
      if (slide.lifestyle) {
        item.classList.add("product-detail-gallery__slide--lifestyle");
      }
      item.setAttribute("role", "group");
      item.setAttribute("aria-label", String(index + 1) + " из " + slides.length);

      if (slide.type === "video") {
        item.classList.add("product-detail-gallery__slide--video");

        var blend = document.createElement("div");
        blend.className = "product-detail-gallery__video-blend";

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
        if (product.slug === "faith-signet") {
          blend.classList.add("product-detail-gallery__video-blend--faith");
          setupFaithVideoBackground(video, blend);
        }
        item.appendChild(blend);
        videos.push(video);
        videoSlideIndex = index;
      } else {
        var img = document.createElement("img");
        img.className = "product-detail-gallery__img";
        img.src = "../../" + slide.src;
        img.alt = slide.alt;
        img.loading = index === 0 ? "eager" : "lazy";
        img.decoding = "async";
        item.appendChild(img);
      }

      track.appendChild(item);
    });

    gallery.appendChild(track);

    var dots = document.createElement("div");
    dots.className = "product-detail-gallery__dots";
    dots.setAttribute("aria-hidden", "true");

    slides.forEach(function (_, index) {
      var dot = document.createElement("span");
      dot.className =
        "product-detail-gallery__dot" +
        (index === 0 ? " product-detail-gallery__dot--active" : "");
      dots.appendChild(dot);
    });

    gallery.appendChild(dots);
    media.appendChild(gallery);

    function setActiveIndex(index) {
      var dotEls = dots.querySelectorAll(".product-detail-gallery__dot");
      dotEls.forEach(function (dot, i) {
        dot.classList.toggle("product-detail-gallery__dot--active", i === index);
      });
      videos.forEach(function (video) {
        if (index === videoSlideIndex) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }

    function readActiveIndex() {
      var width = track.clientWidth;
      if (!width) return 0;
      return Math.min(
        slides.length - 1,
        Math.max(0, Math.round(track.scrollLeft / width))
      );
    }

    var scrollTimer;
    track.addEventListener(
      "scroll",
      function () {
        clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(function () {
          setActiveIndex(readActiveIndex());
        }, 60);
      },
      { passive: true }
    );

    window.addEventListener("resize", function () {
      setActiveIndex(readActiveIndex());
    });

    setActiveIndex(0);
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
