const SITE_URL = process.env.SITE_URL || "https://www.astrisjewelry.ru";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function formatAmount(rubles) {
  return Number(rubles).toFixed(2);
}

function parsePrice(price) {
  if (typeof price === "number") return price;
  var cleaned = String(price || "")
    .replace(/\s/g, "")
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");
  return Number(cleaned) || 0;
}

function buildReceiptItems(items) {
  return items.map(function (item) {
    var qty = Math.max(1, Number(item.quantity) || 1);
    var unit =
      typeof item.price === "number" ? item.price : parsePrice(item.price);
    return {
      description: String(item.name || "Товар ASTRIS").slice(0, 128),
      quantity: String(qty),
      amount: {
        value: formatAmount(unit),
        currency: "RUB",
      },
      vat_code: 1,
      payment_mode: "full_payment",
      payment_subject: "commodity",
    };
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "method_not_allowed" });
    return;
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    json(res, 503, {
      error: "payment_not_configured",
      message:
        "Платёжная система настраивается. Напишите на contact@astrisjewelry.ru",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      json(res, 400, { error: "invalid_json" });
      return;
    }
  }
  body = body || {};

  const items = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer || {};
  const total = Number(body.total);

  if (!items.length || !total || total < 1) {
    json(res, 400, { error: "empty_cart" });
    return;
  }

  if (!customer.name || !customer.phone || !customer.email) {
    json(res, 400, { error: "missing_customer" });
    return;
  }

  const descriptionItems = items
    .slice(0, 3)
    .map(function (item) {
      return item.name;
    })
    .join(", ");
  const description =
    "Заказ ASTRIS: " +
    descriptionItems +
    (items.length > 3 ? " и ещё " + (items.length - 3) : "");

  const idempotenceKey =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + Math.random().toString(36).slice(2);

  const auth = Buffer.from(shopId + ":" + secretKey).toString("base64");
  const phoneDigits = String(customer.phone).replace(/\D+/g, "");

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: formatAmount(total),
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: SITE_URL + "/checkout/success/",
        },
        description: description.slice(0, 128),
        metadata: {
          customer_name: String(customer.name).slice(0, 100),
          customer_phone: String(customer.phone).slice(0, 32),
          customer_email: String(customer.email).slice(0, 100),
          customer_city: String(customer.city || "").slice(0, 100),
          customer_address: String(customer.address || "").slice(0, 200),
          customer_comment: String(customer.comment || "").slice(0, 200),
        },
        receipt: {
          customer: {
            email: String(customer.email).slice(0, 100),
            phone: phoneDigits,
          },
          items: buildReceiptItems(items),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      json(res, 502, {
        error: "yookassa_error",
        message: data.description || "Не удалось создать платёж",
      });
      return;
    }

    const confirmationUrl =
      data.confirmation && data.confirmation.confirmation_url;

    if (!confirmationUrl) {
      json(res, 502, {
        error: "yookassa_error",
        message: "ЮKassa не вернула ссылку на оплату",
      });
      return;
    }

    json(res, 200, {
      paymentId: data.id,
      confirmationUrl: confirmationUrl,
    });
  } catch (e) {
    json(res, 500, {
      error: "server_error",
      message: "Ошибка соединения с платёжным сервисом",
    });
  }
};
