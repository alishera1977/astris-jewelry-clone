<?php
/**
 * Диагностика оплаты без раскрытия секретов.
 * Откройте: /api/payment-status.php
 * После настройки удалите этот файл с сервера.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$candidates = array(
  __DIR__ . '/keys.php',
  __DIR__ . '/yookassa-config.php',
);

$foundFile = null;
$config = null;
foreach ($candidates as $configFile) {
  if (!is_file($configFile)) {
    continue;
  }
  $foundFile = basename($configFile);
  $config = include $configFile;
  if (is_array($config)) {
    break;
  }
}

$shopId = (is_array($config) && isset($config['shop_id'])) ? trim((string) $config['shop_id']) : '';
$secretKey = (is_array($config) && isset($config['secret_key'])) ? trim((string) $config['secret_key']) : '';

echo json_encode(array(
  'config_file' => $foundFile,
  'config_file_exists' => $foundFile !== null,
  'config_is_array' => is_array($config),
  'has_shop_id' => $shopId !== '',
  'has_secret_key' => $secretKey !== '',
  'shop_id_length' => strlen($shopId),
  'secret_key_length' => strlen($secretKey),
  'php_version' => PHP_VERSION,
  'curl_enabled' => function_exists('curl_init'),
  'ready' => is_array($config) && $shopId !== '' && $secretKey !== '' && function_exists('curl_init'),
), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
