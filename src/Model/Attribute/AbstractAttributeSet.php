<?php

declare(strict_types=1);

namespace App\Model\Attribute;

abstract class AbstractAttributeSet
{
    protected string $id;
    protected string $name;
    /** @var AbstractAttributeItem[] */
    protected array $items;

    /**
     * @param AbstractAttributeItem[] $items
     */
    public function __construct(string $id, string $name, array $items)
    {
        $this->id = $id;
        $this->name = $name;
        $this->items = $items;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    /** @return AbstractAttributeItem[] */
    public function getItems(): array
    {
        return $this->items;
    }

    abstract public function getType(): string;
}
