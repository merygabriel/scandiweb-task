<?php

declare(strict_types=1);

namespace App\GraphQL;

use App\GraphQL\Type\AttributeItemType;
use App\GraphQL\Type\AttributeSetType;
use App\GraphQL\Type\CategoryType;
use App\GraphQL\Type\CurrencyType;
use App\GraphQL\Type\PriceType;
use App\GraphQL\Type\ProductType;
use App\Repository\CategoryRepository;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;

final class SchemaBuilder
{
    public function build(): Schema
    {
        $currencyType = new CurrencyType();
        $priceType = new PriceType($currencyType);
        $attributeItemType = new AttributeItemType();
        $attributeSetType = new AttributeSetType($attributeItemType);
        $categoryType = new CategoryType();
        $productAttributeResolver = new \App\GraphQL\Resolver\ProductAttributeResolver();
        $productType = new ProductType($attributeSetType, $priceType, $productAttributeResolver);

        $categoryRepo = new CategoryRepository();
        $productRepo = new ProductRepository();
        $orderRepo = new OrderRepository();

        $queryType = new ObjectType([
            'name' => 'Query',
            'fields' => [
                'categories' => [
                    'type' => Type::listOf($categoryType),
                    'resolve' => static fn() => $categoryRepo->findAll(),
                ],
                'products' => [
                    'type' => Type::listOf($productType),
                    'args' => [
                        'category' => ['type' => Type::string()],
                    ],
                    'resolve' => static fn($root, array $args) => $productRepo->findByCategory($args['category'] ?? null),
                ],
                'product' => [
                    'type' => $productType,
                    'args' => [
                        'id' => ['type' => Type::nonNull(Type::string())],
                    ],
                    'resolve' => static fn($root, array $args) => $productRepo->findById($args['id']),
                ],
            ],
        ]);

        $placeOrderInputType = new \GraphQL\Type\Definition\InputObjectType([
            'name' => 'PlaceOrderInput',
            'fields' => [
                'items' => [
                    'type' => Type::nonNull(Type::listOf(new \GraphQL\Type\Definition\InputObjectType([
                        'name' => 'OrderItemInput',
                        'fields' => [
                            'productId' => ['type' => Type::nonNull(Type::string())],
                            'quantity' => ['type' => Type::nonNull(Type::int())],
                            'selectedAttributes' => [
                                'type' => Type::listOf(new \GraphQL\Type\Definition\InputObjectType([
                                    'name' => 'SelectedAttributeInput',
                                    'fields' => [
                                        'attributeId' => ['type' => Type::nonNull(Type::string())],
                                        'value' => ['type' => Type::nonNull(Type::string())],
                                    ],
                                ])),
                            ],
                        ],
                    ]))),
                ],
            ],
        ]);

        $mutationType = new ObjectType([
            'name' => 'Mutation',
            'fields' => [
                'placeOrder' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                        'input' => ['type' => Type::nonNull($placeOrderInputType)],
                    ],
                    'resolve' => static function ($root, array $args) use ($orderRepo): string {
                        $items = [];
                        foreach ($args['input']['items'] as $item) {
                            $attrs = [];
                            foreach ($item['selectedAttributes'] ?? [] as $a) {
                                $attrs[$a['attributeId']] = $a['value'];
                            }
                            $items[] = [
                                'productId' => $item['productId'],
                                'quantity' => $item['quantity'],
                                'selectedAttributes' => $attrs,
                            ];
                        }
                        return $orderRepo->create($items);
                    },
                ],
            ],
        ]);

        return new Schema([
            'query' => $queryType,
            'mutation' => $mutationType,
        ]);
    }
}
