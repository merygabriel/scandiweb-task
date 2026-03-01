<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\Model\Currency\Currency;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class CurrencyType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Currency',
            'fields' => [
                'label' => [
                    'type' => Type::string(),
                    'resolve' => static fn(Currency $c): string => $c->getLabel(),
                ],
                'symbol' => [
                    'type' => Type::string(),
                    'resolve' => static fn(Currency $c): string => $c->getSymbol(),
                ],
            ],
        ]);
    }
}
