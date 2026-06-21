(function () {
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
      submitBtn.textContent = "Оплатить заказ";
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
      submitBtn.textContent = "Переход к оплате…";
    }
    showError("");

    fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.getItems(),
        customer: customer,
        total: cart.getTotal(),
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.confirmationUrl) {
          window.location.href = result.data.confirmationUrl;
          return;
        }

        var message =
          (result.data && result.data.message) ||
          "Не удалось перейти к оплате. Напишите на contact@astrisjewelry.ru";
        showError(message);
      })
      .catch(function () {
        showError("Ошибка сети. Попробуйте ещё раз или напишите на contact@astrisjewelry.ru");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSummary);
  } else {
    renderSummary();
  }
})();
