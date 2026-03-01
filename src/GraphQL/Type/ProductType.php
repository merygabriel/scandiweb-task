<?php

declare(strict_types=1);

namespace App\GraphQL\Type;

use App\GraphQL\Resolver\ProductAttributeResolver;
use App\Model\Product\AbstractProduct;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

final class ProductType extends ObjectType
{
    public function __construct(
        AttributeSetType $attributeSetType,
        PriceType $priceType,
        ProductAttributeResolver $attributeResolver
    ) {
        parent::__construct([
            'name' => 'Product',
            'fields' => [
                'id' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractProduct $p): string => $p->getId(),
                ],
                'name' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractProduct $p): string => $p->getName(),
                ],
                'inStock' => [
                    'type' => Type::boolean(),
                    'resolve' => static fn(AbstractProduct $p): bool => $p->getInStock(),
                ],
                'gallery' => [
                    'type' => Type::listOf(Type::string()),
                    'resolve' => static fn(AbstractProduct $p): array => $p->getGallery(),
                ],
                'description' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractProduct $p): string => $p->getDescription(),
                ],
                'category' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractProduct $p): string => $p->getCategory()->getName(),
                ],
                'attributes' => [
                    'type' => Type::listOf($attributeSetType),
                    'resolve' => static fn(AbstractProduct $p) => $attributeResolver->resolve($p),
                ],
                'prices' => [
                    'type' => Type::listOf($priceType),
                    'resolve' => static fn(AbstractProduct $p): array => $p->getPrices(),
                ],
                'brand' => [
                    'type' => Type::string(),
                    'resolve' => static fn(AbstractProduct $p): string => $p->getBrand(),
                ],
            ],
        ]);
    }
}
