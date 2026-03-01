<?php

declare(strict_types=1);

namespace App\Repository;

use App\Config\Database;
use App\Model\Category\AbstractCategory;
use App\Model\Product\AbstractProduct;
use App\Model\Product\DefaultProduct;
use App\Model\Product\Price;
use App\Model\Currency\Currency;
use PDO;

final class ProductRepository
{
    private PDO $db;
    private CategoryRepository $categoryRepo;
    private AttributeRepository $attributeRepo;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->categoryRepo = new CategoryRepository();
        $this->attributeRepo = new AttributeRepository();
    }

    /** @return AbstractProduct[] */
    public function findByCategory(?string $categoryName): array
    {
        if ($categoryName === null || $categoryName === 'all') {
            return $this->findAll();
        }
        $stmt = $this->db->prepare(
            'SELECT p.id, p.name, p.in_stock, p.gallery, p.description, p.category_id, p.brand
             FROM product p
             JOIN category c ON p.category_id = c.id
             WHERE c.name = ?
             ORDER BY p.name'
        );
        $stmt->execute([$categoryName]);
        return $this->hydrateList($stmt);
    }

    /** @return AbstractProduct[] */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT id, name, in_stock, gallery, description, category_id, brand FROM product ORDER BY name'
        );
        return $this->hydrateList($stmt);
    }

    public function findById(string $id): ?AbstractProduct
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, in_stock, gallery, description, category_id, brand FROM product WHERE id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            return null;
        }
        return $this->hydrateRow($row);
    }

    /** @return AbstractProduct[] */
    private function hydrateList(\PDOStatement $stmt): array
    {
        $list = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $list[] = $this->hydrateRow($row);
        }
        return $list;
    }

    private function hydrateRow(array $row): AbstractProduct
    {
        $category = $this->categoryRepo->findById($row['category_id']);
        if ($category === null) {
            throw new \RuntimeException('Category not found for product ' . $row['id']);
        }
        $gallery = json_decode($row['gallery'], true) ?: [];
        $attributeSets = $this->attributeRepo->findByProductId($row['id']);
        $prices = $this->loadPrices($row['id']);
        return new DefaultProduct(
            $row['id'],
            $row['name'],
            (bool) $row['in_stock'],
            $gallery,
            $row['description'] ?? '',
            $category,
            $attributeSets,
            $prices,
            $row['brand'] ?? ''
        );
    }

    /** @return Price[] */
    private function loadPrices(string $productId): array
    {
        $stmt = $this->db->prepare(
            'SELECT pr.amount, c.label, c.symbol FROM price pr JOIN currency c ON pr.currency_id = c.id WHERE pr.product_id = ?'
        );
        $stmt->execute([$productId]);
        $prices = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $prices[] = new Price((float) $row['amount'], new Currency($row['label'], $row['symbol']));
        }
        return $prices;
    }
}
