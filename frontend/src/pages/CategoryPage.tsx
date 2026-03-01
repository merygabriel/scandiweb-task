import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { graphql, GET_CATEGORIES, GET_PRODUCTS } from '../api/graphql';
import type { GetCategoriesData, GetProductsData } from '../api/graphql';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';

function toKebab(str: string): string {
  return str.replace(/\s+/g, '-').toLowerCase();
}

export default function CategoryPage() {
  const { categoryName } = useParams();
  const effectiveCategory = categoryName || 'all';
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      graphql<GetCategoriesData>(GET_CATEGORIES),
      graphql<GetProductsData>(GET_PRODUCTS, {
        category: effectiveCategory === 'all' ? null : effectiveCategory,
      }),
    ])
      .then(([catData, prodData]) => {
        if (cancelled) return;
        setCategories(catData.categories || []);
        setProducts(prodData.products || []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveCategory]);

  const categoryTitle =
    effectiveCategory === 'all'
      ? 'All'
      : effectiveCategory.charAt(0).toUpperCase() + effectiveCategory.slice(1);

  if (loading) {
    return (
      <div className="category-loading">
        Loading…
        <p className="category-loading-hint">
          If this hangs, start the backend: <code>php -S localhost:8084 -t public</code>
        </p>
      </div>
    );
  }
  if (error) return <div className="category-error">Error: {error}</div>;

  return (
    <div className="category-page" data-testid="category-page">
      <h1 className="category-title">{categoryTitle}</h1>
      <div className="product-grid" data-testid="product-list">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            data-testid={`product-${toKebab(product.name)}`}
          />
        ))}
      </div>
    </div>
  );
}
