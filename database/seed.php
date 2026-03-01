<?php

declare(strict_types=1);

/**
 * Run from project root: php database/seed.php
 * Requires .env with DB_* and database created from schema.sql
 */

require_once __DIR__ . '/../vendor/autoload.php';

$projectRoot = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$envPath = $projectRoot . DIRECTORY_SEPARATOR . '.env';

// Load .env via Dotenv if possible
if (is_readable($envPath)) {
    $dotenv = Dotenv\Dotenv::createImmutable($projectRoot);
    $dotenv->load();
}

// Fallback: if DB_PASS still not set (e.g. putenv disabled or WSL path), parse .env manually into $_ENV
if (getenv('DB_PASS') === false && empty($_ENV['DB_PASS'])) {
    $tryPaths = [$envPath, __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '.env'];
    foreach ($tryPaths as $path) {
        $content = @file_get_contents($path);
        if ($content !== false) {
            $lines = preg_split('/\r\n|\r|\n/', $content);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') {
                    continue;
                }
                if (strpos($line, '=') !== false) {
                    [$name, $value] = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value, " \t\n\r\0\x0b\"'");
                    $_ENV[$name] = $value;
                }
            }
            break;
        }
    }
}

if (getenv('DB_PASS') === false && empty($_ENV['DB_PASS'])) {
    fwrite(STDERR, "DB_PASS not set. Create .env in project root with DB_HOST, DB_NAME, DB_USER, DB_PASS.\n");
    fwrite(STDERR, "Tried: {$envPath}\n");
    exit(1);
}

$db = \App\Config\Database::getConnection();
$json = file_get_contents(__DIR__ . '/data.json');
$data = json_decode($json, true)['data'] ?? [];

// Ensure currency exists
$db->exec("INSERT IGNORE INTO currency (id, label, symbol) VALUES ('USD', 'USD', '\$')");

$categories = $data['categories'] ?? [];
foreach ($categories as $cat) {
    $name = $cat['name'];
    $db->prepare('INSERT IGNORE INTO category (id, name) VALUES (?, ?)')->execute([$name, $name]);
}

$products = $data['products'] ?? [];
foreach ($products as $p) {
    $db->prepare(
        'REPLACE INTO product (id, name, in_stock, gallery, description, category_id, brand) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $p['id'],
        $p['name'],
        $p['inStock'] ? 1 : 0,
        json_encode($p['gallery'] ?? []),
        $p['description'] ?? '',
        $p['category'],
        $p['brand'] ?? '',
    ]);
    foreach ($p['prices'] ?? [] as $price) {
        $db->prepare(
            'INSERT IGNORE INTO price (product_id, currency_id, amount) VALUES (?, ?, ?)'
        )->execute([$p['id'], $price['currency'] ?? 'USD', $price['amount']]);
    }
    $db->prepare('DELETE FROM attribute_set WHERE product_id = ?')->execute([$p['id']]);
    foreach ($p['attributes'] ?? [] as $set) {
        $setId = $p['id'] . '_' . $set['id'];
        $db->prepare(
            'INSERT INTO attribute_set (id, product_id, name, type) VALUES (?, ?, ?, ?)'
        )->execute([$setId, $p['id'], $set['name'], $set['type'] ?? 'text']);
        foreach ($set['items'] ?? [] as $item) {
            $itemId = $setId . '_' . $item['id'];
            $db->prepare(
                'INSERT INTO attribute_item (id, attribute_set_id, display_value, value) VALUES (?, ?, ?, ?)'
            )->execute([$itemId, $setId, $item['displayValue'], $item['value']]);
        }
    }
}

echo "Seed completed.\n";
