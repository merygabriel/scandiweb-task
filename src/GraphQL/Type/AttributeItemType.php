<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\Model\Attribute\AbstractAttributeItem;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class AttributeItemType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Attribute',
            'fields' => [
                'id' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeItem $a): string => $a->getId(),
                ],
                'displayValue' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeItem $a): string => $a->getDisplayValue(),
                ],
                'value' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeItem $a): string => $a->getValue(),
                ],
            ],
        ]);
    }
}
