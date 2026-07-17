(function () {
  var ORDERS_KEY = "astris-orders";
  var PAYMENT_ENDPOINTS = [
    "/api/create-payment.php",
    "/api/create-payment",
  ];

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
      submitBtn.textContent = "Перейти к оплате";
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

  function createPayment(payload) {
    var lastError = null;

    function tryEndpoint(index) {
      if (index >= PAYMENT_ENDPOINTS.length) {
        return Promise.reject(lastError || new Error("payment_failed"));
      }

      return fetch(PAYMENT_ENDPOINTS[index], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(function (response) {
        return response.json().then(function (data) {
          if (response.ok && data.confirmationUrl) {
            return data;
          }

          if (
            response.status === 404 ||
            response.status === 405 ||
            response.status === 501
          ) {
            lastError = data;
            return tryEndpoint(index + 1);
          }

          var err = new Error(
            (data && data.message) || "Не удалось создать платёж"
          );
          err.data = data;
          throw err;
        });
      });
    }

    return tryEndpoint(0);
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
      submitBtn.textContent = "Создание платежа…";
    }
    showError("");

    var items = cart.getItems();
    var total = cart.getTotal();
    var order = {
      id: "order-" + Date.now(),
      createdAt: new Date().toISOString(),
      items: items,
      total: total,
      customer: customer,
    };

    createPayment({
      items: items.map(function (item) {
        return {
          name: item.name,
          price: item.priceValue || item.price,
          quantity: item.quantity,
        };
      }),
      total: total,
      customer: customer,
    })
      .then(function (data) {
        order.paymentId = data.paymentId || "";
        saveOrder(order);
        if (cart.clear) {
          cart.clear();
        }
        window.location.href = data.confirmationUrl;
      })
      .catch(function (err) {
        var message =
          (err && err.message) ||
          "Не удалось перейти к оплате. Попробуйте позже или напишите на contact@astrisjewelry.ru";
        if (err && err.data && err.data.error === "payment_not_configured") {
          message =
            err.data.message ||
            "Онлайн-оплата ещё настраивается. Напишите на contact@astrisjewelry.ru";
        }
        showError(message);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSummary);
  } else {
    renderSummary();
  }
})();
