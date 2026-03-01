<?php

declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use App\Model\Category\DefaultCategory;
use App\Model\Category\AbstractCategory;
use PDO;

final class CategoryRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /** @return AbstractCategory[] */
    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT id, name FROM category ORDER BY id');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $list = [];
        foreach ($rows as $row) {
            $list[] = new DefaultCategory($row['id'], $row['name']);
        }
        return $list;
    }

    public function findByName(string $name): ?AbstractCategory
    {
        $stmt = $this->db->prepare('SELECT id, name FROM category WHERE name = ?');
        $stmt->execute([$name]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }
        return new DefaultCategory($row['id'], $row['name']);
    }

    public function findById(string $id): ?AbstractCategory
    {
        $stmt = $this->db->prepare('SELECT id, name FROM category WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }
        return new DefaultCategory($row['id'], $row['name']);
    }
}
