<?php

declare(strict_types=1);

namespace App\GraphQL\Resolver;

use App\Model\Product\AbstractProduct;

/**
 * Resolves 'attributes' field for Product. Attributes are their own type
 * and resolved through this dedicated resolver (not on Product schema directly).
 */
final class ProductAttributeResolver
{
    /**
     * @return \App\Model\Attribute\AbstractAttributeSet[]
     */
    public function resolve(AbstractProduct $product): array
    {
        return $product->getAttributeSets();
    }
}
