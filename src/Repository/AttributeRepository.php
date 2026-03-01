<?php

declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use App\Model\Attribute\AbstractAttributeSet;
use App\Model\Attribute\AbstractAttributeItem;
use App\Model\Attribute\TextAttributeSet;
use App\Model\Attribute\SwatchAttributeSet;
use App\Model\Attribute\DefaultAttributeItem;
use PDO;

final class AttributeRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /** @return AbstractAttributeSet[] */
    public function findByProductId(string $productId): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, type FROM attribute_set WHERE product_id = ? ORDER BY id'
        );
        $stmt->execute([$productId]);
        $sets = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items = $this->loadItems($row['id']);
            $sets[] = $this->createAttributeSet($row['type'], $row['id'], $row['name'], $items);
        }
        return $sets;
    }

    /** @return AbstractAttributeItem[] */
    private function loadItems(string $setId): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, display_value, value FROM attribute_item WHERE attribute_set_id = ? ORDER BY id'
        );
        $stmt->execute([$setId]);
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = new DefaultAttributeItem(
                $row['id'],
                $row['display_value'],
                $row['value']
            );
        }
        return $items;
    }

    /**
     * @param AbstractAttributeItem[] $items
     */
    private function createAttributeSet(string $type, string $id, string $name, array $items): AbstractAttributeSet
    {
        if ($type === 'swatch') {
            return new SwatchAttributeSet($id, $name, $items);
        }
        return new TextAttributeSet($id, $name, $items);
    }
}
