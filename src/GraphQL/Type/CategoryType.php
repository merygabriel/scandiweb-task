<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\Model\Category\AbstractCategory;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class CategoryType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Category',
            'fields' => [
                'name' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractCategory $c): string => $c->getName(),
                ],
            ],
        ]);
    }
}
