<?php

declare(strict_types=1);

namespace App\Model\Product;

use App\Model\Category\AbstractCategory;

abstract class AbstractProduct
{
    protected string $id;
    protected string $name;
    protected bool $inStock;
    /** @var string[] */
    protected array $gallery;
    protected string $description;
    protected AbstractCategory $category;
    /** @var \App\Model\Attribute\AbstractAttributeSet[] */
    protected array $attributeSets;
    /** @var \App\Model\Product\Price[] */
    protected array $prices;
    protected string $brand;

    /**
     * @param \App\Model\Attribute\AbstractAttributeSet[] $attributeSets
     * @param \App\Model\Product\Price[] $prices
     */
    public function __construct(
        string $id,
        string $name,
        bool $inStock,
        array $gallery,
        string $description,
        AbstractCategory $category,
        array $attributeSets,
        array $prices,
        string $brand
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->inStock = $inStock;
        $this->gallery = $gallery;
        $this->description = $description;
        $this->category = $category;
        $this->attributeSets = $attributeSets;
        $this->prices = $prices;
        $this->brand = $brand;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getInStock(): bool
    {
        return $this->inStock;
    }

    /** @return string[] */
    public function getGallery(): array
    {
        return $this->gallery;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getCategory(): AbstractCategory
    {
        return $this->category;
    }

    /** @return \App\Model\Attribute\AbstractAttributeSet[] */
    public function getAttributeSets(): array
    {
        return $this->attributeSets;
    }

    /** @return \App\Model\Product\Price[] */
    public function getPrices(): array
    {
        return $this->prices;
    }

    public function getBrand(): string
    {
        return $this->brand;
    }
}
