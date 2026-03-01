<?php

declare(strict_types=1);

namespace App\Model\Category;

final class DefaultCategory extends AbstractCategory
{
    public function getDisplayName(): string
    {
        return ucfirst(strtolower($this->name));
    }
}
