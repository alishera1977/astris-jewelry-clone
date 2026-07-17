<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function astris_substr($value, $start, $length) {
  $value = (string) $value;
  if (function_exists('mb_substr')) {
    return mb_substr($value, $start, $length, 'UTF-8');
  }
  return substr($value, $start, $length);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

$configFile = __DIR__ . '/yookassa-config.php';
if (!is_file($configFile)) {
  http_response_code(503);
  echo json_encode([
    'error' => 'payment_not_configured',
    'message' => 'Платёжная система настраивается. Напишите на contact@astrisjewelry.ru',
  ]);
  exit;
}

$config = require $configFile;
$shopId = isset($config['shop_id']) ? trim((string) $config['shop_id']) : '';
$secretKey = isset($config['secret_key']) ? trim((string) $config['secret_key']) : '';
$siteUrl = isset($config['site_url']) ? rtrim((string) $config['site_url'], '/') : 'https://www.astrisjewelry.ru';

if ($shopId === '' || $secretKey === '') {
  http_response_code(503);
  echo json_encode([
    'error' => 'payment_not_configured',
    'message' => 'Платёжная система настраивается. Напишите на contact@astrisjewelry.ru',
  ]);
  exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid_json']);
  exit;
}

$items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
$customer = isset($body['customer']) && is_array($body['customer']) ? $body['customer'] : [];
$total = isset($body['total']) ? (float) $body['total'] : 0;

if (!$items || $total < 1) {
  http_response_code(400);
  echo json_encode(['error' => 'empty_cart']);
  exit;
}

$name = isset($customer['name']) ? trim((string) $customer['name']) : '';
$phone = isset($customer['phone']) ? trim((string) $customer['phone']) : '';
$email = isset($customer['email']) ? trim((string) $customer['email']) : '';

if ($name === '' || $phone === '' || $email === '') {
  http_response_code(400);
  echo json_encode(['error' => 'missing_customer']);
  exit;
}

$names = [];
foreach (array_slice($items, 0, 3) as $item) {
  if (!empty($item['name'])) {
    $names[] = (string) $item['name'];
  }
}
$description = 'Заказ ASTRIS: ' . implode(', ', $names);
if (count($items) > 3) {
  $description .= ' и ещё ' . (count($items) - 3);
}
$description = astris_substr($description, 0, 128);

$idempotenceKey = sprintf(
  '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
  mt_rand(0, 0xffff),
  mt_rand(0, 0xffff),
  mt_rand(0, 0xffff),
  mt_rand(0, 0x0fff) | 0x4000,
  mt_rand(0, 0x3fff) | 0x8000,
  mt_rand(0, 0xffff),
  mt_rand(0, 0xffff),
  mt_rand(0, 0xffff)
);

$payload = [
  'amount' => [
    'value' => number_format($total, 2, '.', ''),
    'currency' => 'RUB',
  ],
  'capture' => true,
  'confirmation' => [
    'type' => 'redirect',
    'return_url' => $siteUrl . '/checkout/success/',
  ],
  'description' => $description,
  'metadata' => [
    'customer_name' => astris_substr($name, 0, 100),
    'customer_phone' => astris_substr($phone, 0, 32),
    'customer_email' => astris_substr($email, 0, 100),
    'customer_city' => astris_substr(isset($customer['city']) ? (string) $customer['city'] : '', 0, 100),
    'customer_address' => astris_substr(isset($customer['address']) ? (string) $customer['address'] : '', 0, 200),
    'customer_comment' => astris_substr(isset($customer['comment']) ? (string) $customer['comment'] : '', 0, 200),
  ],
  'receipt' => [
    'customer' => [
      'email' => $email,
      'phone' => preg_replace('/\D+/', '', $phone),
    ],
    'items' => array_map(function ($item) {
      $qty = max(1, (int) (isset($item['quantity']) ? $item['quantity'] : 1));
      if (isset($item['price']) && is_numeric($item['price'])) {
        $priceNum = (float) $item['price'];
      } else {
        $priceRaw = isset($item['price']) ? (string) $item['price'] : '0';
        $priceNum = (float) str_replace(',', '.', preg_replace('/[^\d.,]/', '', str_replace(' ', '', $priceRaw)));
      }
      $amount = number_format($priceNum, 2, '.', '');
      return [
        'description' => astris_substr(isset($item['name']) ? (string) $item['name'] : 'Товар ASTRIS', 0, 128),
        'quantity' => (string) $qty,
        'amount' => [
          'value' => $amount,
          'currency' => 'RUB',
        ],
        'vat_code' => 1,
        'payment_mode' => 'full_payment',
        'payment_subject' => 'commodity',
      ];
    }, $items),
  ],
];

$ch = curl_init('https://api.yookassa.ru/v3/payments');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($shopId . ':' . $secretKey),
    'Idempotence-Key: ' . $idempotenceKey,
  ],
  CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
  CURLOPT_TIMEOUT => 30,
]);

$responseBody = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($responseBody === false) {
  http_response_code(500);
  echo json_encode([
    'error' => 'server_error',
    'message' => 'Ошибка соединения с платёжным сервисом',
    'detail' => $curlError,
  ]);
  exit;
}

$data = json_decode($responseBody, true);
if ($httpCode < 200 || $httpCode >= 300 || !is_array($data)) {
  http_response_code(502);
  echo json_encode([
    'error' => 'yookassa_error',
    'message' => is_array($data) && !empty($data['description'])
      ? $data['description']
      : 'Не удалось создать платёж',
  ]);
  exit;
}

$confirmationUrl = isset($data['confirmation']['confirmation_url'])
  ? $data['confirmation']['confirmation_url']
  : null;

if (!$confirmationUrl) {
  http_response_code(502);
  echo json_encode([
    'error' => 'yookassa_error',
    'message' => 'ЮKassa не вернула ссылку на оплату',
  ]);
  exit;
}

http_response_code(200);
echo json_encode([
  'paymentId' => isset($data['id']) ? $data['id'] : null,
  'confirmationUrl' => $confirmationUrl,
]);
