<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\Model\Attribute\AbstractAttributeSet;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class AttributeSetType extends ObjectType
{
    public function __construct(AttributeItemType $attributeItemType)
    {
        parent::__construct([
            'name' => 'AttributeSet',
            'fields' => [
                'id' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeSet $s): string => $s->getId(),
                ],
                'name' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeSet $s): string => $s->getName(),
                ],
                'type' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractAttributeSet $s): string => $s->getType(),
                ],
                'items' => [
                    'type' => Type::listOf($attributeItemType),
                    'resolve' => static fn(AbstractAttributeSet $s): array => $s->getItems(),
                ],
            ],
        ]);
    }
}
