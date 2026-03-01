<?php

declare(strict_types=1);

namespace App\Config;

use PDO;

final class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = self::env('DB_HOST') ?: 'localhost';
            $dbname = self::env('DB_NAME') ?: 'scandiweb';
            $user = self::env('DB_USER') ?: 'root';
            $pass = self::env('DB_PASS');
            if ($pass === null) {
                throw new \RuntimeException(
                    'Database password not set. Create a .env file in the project root (same folder as composer.json) with: DB_HOST=localhost DB_NAME=scandiweb DB_USER=root DB_PASS=your_mysql_password'
                );
            }
            $pass = $pass !== null ? (string) $pass : '';
            $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        }
        return self::$instance;
    }

    private static function env(string $key): ?string
    {
        $v = getenv($key);
        if ($v !== false && $v !== '') {
            return (string) $v;
        }
        return isset($_ENV[$key]) ? (string) $_ENV[$key] : null;
    }
}
