<?php

declare(strict_types=1);

namespace App\Model\Category;

abstract class AbstractCategory
{
    protected string $id;
    protected string $name;

    public function __construct(string $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    abstract public function getDisplayName(): string;
}
