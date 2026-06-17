(function () {
  var MEDIA_ASSET_VERSION = "80";

  function mediaSrc(relativePath) {
    return "../../" + relativePath + "?v=" + MEDIA_ASSET_VERSION;
  }

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

  function findVariantGroup(slug) {
    var groups = window.PRODUCT_VARIANT_GROUPS;
    if (!groups) return null;
    var keys = Object.keys(groups);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (groups[key].order.indexOf(slug) !== -1) {
        return { key: key, group: groups[key] };
      }
    }
    return null;
  }

  function initProductVariants(product, infoSection) {
    var match = findVariantGroup(product.slug);
    if (!match || match.group.order.length < 2 || !infoSection) return;
    var groupKey = match.key;
    var group = match.group;

    var siblings = group.order
      .map(function (s) {
        return products.find(function (p) {
          return p.slug === s;
        });
      })
      .filter(Boolean);

    if (siblings.length < 2) return;

    var block = document.createElement("div");
    block.className =
      "product-detail-variants product-detail-variants--" + groupKey;

    var label = document.createElement("p");
    label.className = "product-detail-variants__label";
    label.textContent = group.label;
    block.appendChild(label);

    var list = document.createElement("div");
    list.className = "product-detail-variants__list";
    list.setAttribute("role", "list");

    siblings.forEach(function (sibling) {
      var isCurrent = sibling.slug === product.slug;
      var link = document.createElement("a");
      link.className =
        "product-detail-variants__option" +
        (isCurrent ? " product-detail-variants__option--active" : "");
      link.href = "../" + sibling.slug + "/";
      link.setAttribute("role", "listitem");
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      }
      link.title = sibling.name;
      link.setAttribute(
        "aria-label",
        (isCurrent ? "Текущий вариант: " : "") + sibling.name
      );

      if (sibling.image) {
        var thumb = document.createElement("span");
        thumb.className = "product-detail-variants__thumb";

        var img = document.createElement("img");
        img.className = "product-detail-variants__img";
        img.src = mediaSrc(sibling.image);
        img.alt = "";
        img.width = 128;
        img.height = 128;
        img.loading = "lazy";
        img.decoding = "async";
        thumb.appendChild(img);
        link.appendChild(thumb);
      }

      var name = document.createElement("span");
      name.className = "product-detail-variants__name";
      name.textContent = sibling.variantLabel || sibling.stone || sibling.name;
      link.appendChild(name);

      list.appendChild(link);
    });

    block.appendChild(list);

    var titleEl = infoSection.querySelector(".product-detail-title");
    if (titleEl && titleEl.nextSibling) {
      infoSection.insertBefore(block, titleEl.nextSibling);
    } else {
      infoSection.appendChild(block);
    }
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
        loneImage.src = mediaSrc(slides[0].src);
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
        video.src = mediaSrc(slide.src);
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
        item.appendChild(blend);
        videos.push(video);
        videoSlideIndex = index;
      } else {
        var img = document.createElement("img");
        img.className = "product-detail-gallery__img";
        img.src = mediaSrc(slide.src);
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

  var infoSection = document.querySelector(".product-detail-info");
  initProductVariants(product, infoSection);

  text(titleEl, product.name);
  text(descEl, product.description || "");
  text(buttonEl, "ДОБАВИТЬ В КОРЗИНУ — " + product.price);
  document.title = product.name + " — ASTRIS";

  var page = document.querySelector(".product-detail-page");
  if (page) {
    page.classList.add("product-detail-page--" + product.slug);
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
