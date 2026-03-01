<?php

declare(strict_types=1);

namespace App\Model\Attribute;

final class TextAttributeSet extends AbstractAttributeSet
{
    public function getType(): string
    {
        return 'text';
    }
}
