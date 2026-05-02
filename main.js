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
})();
