<?php

declare(strict_types=1);

namespace App\Controller;

use App\GraphQL\SchemaBuilder;
use GraphQL\Error\DebugFlag;
use GraphQL\GraphQL;
use GraphQL\Type\Schema;

class GraphQLController
{
    private Schema $schema;

    public function __construct()
    {
        $this->schema = (new SchemaBuilder())->build();
    }

    public function handle(array $vars): void
    {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        $raw = file_get_contents('php://input') ?: '{}';
        $input = json_decode($raw, true) ?: [];
        $query = $input['query'] ?? '';
        $variables = $input['variables'] ?? null;

        if ($query === '') {
            echo json_encode(['errors' => [['message' => 'Missing query']]]);
            return;
        }

        try {
            $result = GraphQL::executeQuery($this->schema, $query, null, null, $variables);
            // Include real error message in response (GraphQL-PHP masks it as "Internal server error" otherwise)
            $debug = DebugFlag::INCLUDE_DEBUG_MESSAGE;
            $output = $result->toArray($debug);
            echo json_encode($output);
        } catch (\Throwable $e) {
            echo json_encode([
                'errors' => [['message' => $e->getMessage()]],
            ]);
        }
    }
}
