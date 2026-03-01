import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import './ProductCard.css';

function formatPrice(prices: Product['prices']): string {
  const p = prices?.[0];
  if (!p) return '$0.00';
  const sym = p.currency?.symbol ?? '$';
  return `${sym}${Number(p.amount).toFixed(2)}`;
}

interface ProductCardProps {
  product: Product;
  'data-testid'?: string;
}

export default function ProductCard({ product, 'data-testid': dataTestId }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [hover, setHover] = useState(false);
  const inStock = product.inStock;
  const showQuickShop = inStock && hover;

  const handleQuickShop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedAttributes: Record<string, string> = {};
    (product.attributes || []).forEach((attr) => {
      const first = attr.items?.[0];
      if (first) selectedAttributes[attr.id] = first.value;
    });
    addToCart(product, selectedAttributes, 1);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      className={`product-card ${!inStock ? 'out-of-stock' : ''}`}
      data-testid={dataTestId ?? `product-${product.name?.toLowerCase().replace(/\s+/g, '-')}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="product-card-image-wrap" onClick={handleCardClick}>
        <img
          src={product.gallery?.[0]}
          alt={product.name}
          className="product-card-image"
        />
        {!inStock && <div className="product-card-out-of-stock">OUT OF STOCK</div>}
        {showQuickShop && (
          <button
            type="button"
            className="product-card-quick-shop"
            onClick={handleQuickShop}
            aria-label="Quick add to cart"
          >
            <span className="quick-shop-icon" />
          </button>
        )}
      </div>
      <div className="product-card-info" onClick={handleCardClick}>
        <p className="product-card-name">{product.name}</p>
        <p className="product-card-price">{formatPrice(product.prices)}</p>
      </div>
    </article>
  );
}
