<?php
/**
 * Диагностика оплаты без раскрытия секретов.
 * Откройте в браузере: https://www.astrisjewelry.ru/api/payment-status.php
 * После успешной настройки удалите этот файл с сервера.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$configFile = __DIR__ . '/yookassa-config.php';
$exists = is_file($configFile);
$config = null;
$includeError = null;

if ($exists) {
  try {
    $config = include $configFile;
  } catch (Exception $e) {
    $includeError = $e->getMessage();
  }
}

$shopId = (is_array($config) && isset($config['shop_id'])) ? trim((string) $config['shop_id']) : '';
$secretKey = (is_array($config) && isset($config['secret_key'])) ? trim((string) $config['secret_key']) : '';

echo json_encode(array(
  'config_file_exists' => $exists,
  'config_is_array' => is_array($config),
  'has_shop_id' => $shopId !== '',
  'has_secret_key' => $secretKey !== '',
  'shop_id_length' => strlen($shopId),
  'secret_key_length' => strlen($secretKey),
  'php_version' => PHP_VERSION,
  'curl_enabled' => function_exists('curl_init'),
  'include_error' => $includeError,
  'ready' => $exists && is_array($config) && $shopId !== '' && $secretKey !== '' && function_exists('curl_init'),
), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
