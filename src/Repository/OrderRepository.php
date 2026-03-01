<?php

declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use PDO;

final class OrderRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(array $items): string
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO `order` (id) VALUES (NULL)');
            $stmt->execute();
            $orderId = $this->db->lastInsertId();
            $itemStmt = $this->db->prepare(
                'INSERT INTO order_item (order_id, product_id, quantity, selected_attributes) VALUES (?, ?, ?, ?)'
            );
            foreach ($items as $item) {
                $itemStmt->execute([
                    $orderId,
                    $item['productId'],
                    $item['quantity'],
                    json_encode($item['selectedAttributes'] ?? []),
                ]);
            }
            $this->db->commit();
            return (string) $orderId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
