<?php
/**
 * Одноразовый установщик ключей ЮKassa для Beget.
 * 1) Загрузите этот файл в папку api/
 * 2) Откройте в браузере: /api/install-keys.php?go=1
 * 3) Удалите install-keys.php с сервера
 */
header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['go']) || $_GET['go'] !== '1') {
  echo "Откройте этот адрес с ?go=1 чтобы создать keys.php\n";
  echo "Пример: https://www.astrisjewelry.ru/api/install-keys.php?go=1\n";
  exit;
}

$target = __DIR__ . '/keys.php';
$code = "<?php\nreturn array(\n  'shop_id' => '1399368',\n  'secret_key' => 'live_kFnCrngU57CSj09clqK8ugm3Sk0CFeH1GbYAghhiHb0',\n  'site_url' => 'https://www.astrisjewelry.ru',\n);\n";

$written = @file_put_contents($target, $code);
if ($written === false) {
  http_response_code(500);
  echo "Не удалось записать keys.php. Проверьте права на папку api/ (chmod 755/775).\n";
  echo "Путь: " . $target . "\n";
  echo "PHP: " . PHP_VERSION . "\n";
  exit;
}

@chmod($target, 0644);

$check = is_file($target) ? include $target : null;
$ok = is_array($check)
  && !empty($check['shop_id'])
  && !empty($check['secret_key']);

if (!$ok) {
  http_response_code(500);
  echo "Файл записан, но не читается корректно. Откройте api/keys.php в файловом менеджере Beget.\n";
  exit;
}

echo "OK: keys.php создан.\n";
echo "shop_id length: " . strlen($check['shop_id']) . "\n";
echo "secret_key length: " . strlen($check['secret_key']) . "\n";
echo "\nСЕЙЧАС УДАЛИТЕ этот файл: api/install-keys.php\n";
echo "Потом откройте: /api/payment-status.php\n";
echo "И попробуйте оплату снова.\n";
