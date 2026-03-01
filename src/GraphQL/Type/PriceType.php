<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\Model\Product\Price;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class PriceType extends ObjectType
{
    public function __construct(CurrencyType $currencyType)
    {
        parent::__construct([
            'name' => 'Price',
            'fields' => [
                'amount' => [
                    'type' => Type::float(),
                    'resolve' => static fn(Price $p): float => (float) $p->getAmount(),
                ],
                'currency' => [
                    'type' => $currencyType,
                    'resolve' => static fn(Price $p) => $p->getCurrency(),
                ],
            ],
        ]);
    }
}
