<?php

declare(strict_types=1);

use App\Controller\GraphQLController;
use FastRoute\RouteCollector;

$projectRoot = dirname(__DIR__);
require_once $projectRoot . '/vendor/autoload.php';

$envPath = $projectRoot . '/.env';
if (is_readable($envPath)) {
    $dotenv = Dotenv\Dotenv::createImmutable($projectRoot);
    $dotenv->load();
} else {
    // Fallback: parse .env manually (e.g. when Dotenv path fails under some servers)
    $content = @file_get_contents($envPath) ?: @file_get_contents(__DIR__ . '/../.env');
    if ($content !== false) {
        foreach (preg_split('/\r\n|\r|\n/', $content) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (strpos($line, '=') !== false) {
                [$name, $value] = explode('=', $line, 2);
                $_ENV[trim($name)] = trim($value, " \t\n\r\0\x0b\"'");
            }
        }
    }
}

$dispatcher = FastRoute\simpleDispatcher(function (RouteCollector $r) {
    $r->post('/graphql', [GraphQLController::class, 'handle']);
});

$httpMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
if (($pos = strpos($uri, '?')) !== false) {
    $uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];
        [$class, $method] = $handler;
        try {
            (new $class())->$method($vars);
        } catch (\Throwable $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'errors' => [['message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]],
            ]);
        }
        break;
}
