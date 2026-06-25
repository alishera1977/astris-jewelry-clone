(function () {
  var ORDERS_KEY = "astris-orders";

  function formatPrice(value) {
    return value.toLocaleString("ru-RU") + " ₽";
  }

  function renderSummary() {
    var cart = window.ASTRIS_CART;
    var listEl = document.getElementById("checkout-items");
    var totalEl = document.getElementById("checkout-total");
    var form = document.getElementById("checkout-form");
    var inner = document.querySelector(".checkout-page__inner");

    if (!cart || !listEl || !inner) return;

    var items = cart.getItems();
    if (!items.length) {
      inner.innerHTML =
        '<div class="checkout-empty">' +
        "<p>Корзина пуста</p>" +
        '<a href="../catalog/">Перейти в каталог</a>' +
        "</div>";
      return;
    }

    listEl.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "checkout-summary__item";
      li.innerHTML =
        '<img src="../' +
        item.image +
        '" alt="" width="56" height="56" loading="lazy" />' +
        "<div>" +
        '<p class="checkout-summary__name">' +
        item.name +
        "</p>" +
        '<p class="checkout-summary__qty">' +
        item.quantity +
        " шт.</p>" +
        "</div>" +
        '<span class="checkout-summary__price">' +
        item.price +
        "</span>";
      listEl.appendChild(li);
    });

    if (totalEl) {
      totalEl.textContent = formatPrice(cart.getTotal());
    }

    if (form) {
      form.addEventListener("submit", onSubmit);
    }
  }

  function showError(message) {
    var errorEl = document.getElementById("checkout-error");
    var submitBtn = document.getElementById("checkout-submit");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить заказ";
    }
  }

  function saveOrder(order) {
    try {
      var orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function onSubmit(e) {
    e.preventDefault();

    var cart = window.ASTRIS_CART;
    if (!cart || !cart.getItems().length) {
      showError("Корзина пуста");
      return;
    }

    var form = e.target;
    var submitBtn = document.getElementById("checkout-submit");
    var consent = document.getElementById("checkout-consent");

    if (!consent || !consent.checked) {
      showError("Подтвердите согласие с офертой и политикой конфиденциальности");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var customer = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      city: form.city.value.trim(),
      address: form.address.value.trim(),
      comment: form.comment.value.trim(),
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправка…";
    }
    showError("");

    var order = {
      id: "order-" + Date.now(),
      createdAt: new Date().toISOString(),
      items: cart.getItems(),
      total: cart.getTotal(),
      customer: customer,
    };

    saveOrder(order);

    if (cart.clear) {
      cart.clear();
    }

    window.location.href = "success/";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSummary);
  } else {
    renderSummary();
  }
})();
