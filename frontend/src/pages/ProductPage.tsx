import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { graphql, GET_PRODUCT } from '../api/graphql';
import type { GetProductData } from '../api/graphql';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import './ProductPage.css';

function formatPrice(prices: Product['prices']): string {
  const p = prices?.[0];
  if (!p) return '$0.00';
  const sym = p.currency?.symbol ?? '$';
  return `${sym}${Number(p.amount).toFixed(2)}`;
}

function toKebab(str: string): string {
  return str.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

interface ProductPageProps {
  onAddToCartOpenCart?: () => void;
}

export default function ProductPage({ onAddToCartOpenCart }: ProductPageProps) {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (!productId) return;
    graphql<GetProductData>(GET_PRODUCT, { id: productId })
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        const defaults: Record<string, string> = {};
        (data.product?.attributes || []).forEach((attr) => {
          const first = attr.items?.[0];
          if (first) defaults[attr.id] = first.value;
        });
        setSelectedAttributes(defaults);
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
  }, [productId]);

  const allSelected =
    !product?.attributes?.length ||
    product.attributes.every((attr) => selectedAttributes[attr.id] != null);

  const handleAddToCart = () => {
    if (!product || !allSelected) return;
    addToCart(product, selectedAttributes, 1);
    onAddToCartOpenCart?.();
  };

  if (loading) return <div className="pdp-loading">Loading...</div>;
  if (error || !product)
    return <div className="pdp-error">Error: {error || 'Product not found'}</div>;

  const gallery = product.gallery || [];
  const mainImage = gallery[galleryIndex] || gallery[0];

  return (
    <div className="pdp" data-testid="pdp">
      <div className="pdp-gallery" data-testid="product-gallery">
        <div className="pdp-thumbnails">
          {gallery.map((url, i) => (
            <button
              key={i}
              type="button"
              className={`pdp-thumb ${i === galleryIndex ? 'active' : ''}`}
              onClick={() => setGalleryIndex(i)}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
        <div className="pdp-main-image-wrap">
          {galleryIndex > 0 && (
            <button
              type="button"
              className="pdp-arrow pdp-arrow-left"
              onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <img
            src={mainImage}
            alt={product.name}
            className="pdp-main-image"
            style={{ maxHeight: 330 }}
          />
          {galleryIndex < gallery.length - 1 && (
            <button
              type="button"
              className="pdp-arrow pdp-arrow-right"
              onClick={() => setGalleryIndex((i) => Math.min(gallery.length - 1, i + 1))}
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      </div>

      <div className="pdp-details">
        <h1 className="pdp-name">{product.name}</h1>

        {(product.attributes || []).map((attr) => (
          <div
            key={attr.id}
            className="pdp-attribute"
            data-testid={`product-attribute-${toKebab(attr.name)}`}
          >
            <span className="pdp-attribute-label">{attr.name.toUpperCase()}:</span>
            <div className="pdp-attribute-options">
              {(attr.items || []).map((item) => {
                const isSelected = selectedAttributes[attr.id] === item.value;
                const isSwatch = attr.type === 'swatch';
                const attrKebab = toKebab(attr.name);
                const valueKebab = item.displayValue.replace(/\s+/g, '-').toLowerCase();
                const testId = `product-attribute-${attrKebab}-${valueKebab}${isSelected ? '-selected' : ''}`;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`pdp-attr-option ${isSwatch ? 'swatch' : 'text'} ${isSelected ? 'selected' : ''}`}
                    style={isSwatch ? { backgroundColor: item.value } : undefined}
                    data-testid={testId}
                    onClick={() =>
                      setSelectedAttributes((s) => ({ ...s, [attr.id]: item.value }))
                    }
                  >
                    {!isSwatch && item.displayValue}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pdp-price-row">
          <span className="pdp-price-label">PRICE:</span>
          <span className="pdp-price">{formatPrice(product.prices)}</span>
        </div>

        <button
          type="button"
          className="pdp-add-to-cart"
          disabled={!product.inStock || !allSelected}
          onClick={handleAddToCart}
          data-testid="add-to-cart"
        >
          ADD TO CART
        </button>

        <div className="pdp-description" data-testid="product-description">
          {product.description ? parse(product.description) : null}
        </div>
      </div>
    </div>
  );
}
