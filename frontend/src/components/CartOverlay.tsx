import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { graphql, PLACE_ORDER } from '../api/graphql';
import type { Product } from '../types';
import './CartOverlay.css';

function toKebab(str: string): string {
  return str.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/** Gallery index from selected Color attribute so thumbnail matches selected color. */
function getGalleryIndexForProduct(product: Product, selectedAttributes: Record<string, string>): number {
  const colorAttr = (product.attributes || []).find(
    (a) => a.id === 'Color' || a.name?.toLowerCase() === 'color'
  );
  if (!colorAttr?.items?.length) return 0;
  const selected = selectedAttributes[colorAttr.id];
  if (selected == null) return 0;
  const idx = colorAttr.items.findIndex((item) => item.value === selected);
  if (idx < 0) return 0;
  const gallery = product.gallery || [];
  return idx < gallery.length ? idx : 0;
}

function formatPrice(prices: Product['prices']): string {
  const p = prices?.[0];
  if (!p) return '$0.00';
  const sym = p.currency?.symbol ?? '$';
  return `${sym}${Number(p.amount).toFixed(2)}`;
}

interface CartOverlayProps {
  onClose: () => void;
  onBackdropClick: () => void;
  onOrderSuccess?: () => void;
}

export default function CartOverlay({ onClose, onBackdropClick, onOrderSuccess }: CartOverlayProps) {
  const { items, totalItems, totalAmount, updateQuantity, updateCartItemAttributes, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);

  const itemLabel = totalItems === 1 ? '1 Item' : `${totalItems} Items`;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const input = {
        items: items.map(({ product, selectedAttributes, quantity }) => ({
          productId: product.id,
          quantity,
          selectedAttributes: Object.entries(selectedAttributes).map(([attributeId, value]) => ({
            attributeId,
            value,
          })),
        })),
      };
      await graphql(PLACE_ORDER, { input });
      clearCart();
      onOrderSuccess?.();
    } catch {
      setPlacing(false);
    }
    setPlacing(false);
  };

  return (
    <>
      <div
        className="cart-overlay-backdrop"
        onClick={onBackdropClick}
        aria-hidden="true"
      />
      <aside className="cart-overlay" data-testid="cart-overlay">
        <div className="cart-overlay-header">
          <h2 className="cart-overlay-title">My Bag, {itemLabel}</h2>
          <button type="button" className="cart-overlay-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cart-overlay-list">
          {items.map(({ product, selectedAttributes, quantity }, idx) => (
            <div key={idx} className="cart-item">
              <div className="cart-item-info">
                <p className="cart-item-name">{product.name}</p>
                <p className="cart-item-price">{formatPrice(product.prices)}</p>
                {(product.attributes || []).map((attr) => (
                  <div
                    key={attr.id}
                    className="cart-item-attribute"
                    data-testid={`cart-item-attribute-${toKebab(attr.name)}`}
                  >
                    {(attr.items || []).map((item) => {
                      const isSelected = selectedAttributes[attr.id] === item.value;
                      const valueKebab = toKebab(String(item.value));
                      const attrKebab = toKebab(attr.name);
                      const testId = `cart-item-attribute-${attrKebab}-${valueKebab}${isSelected ? '-selected' : ''}`;
                      const isSwatch = attr.type === 'swatch';
                      const newAttributes = { ...selectedAttributes, [attr.id]: item.value };
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`cart-item-attr-option ${isSwatch ? 'swatch' : 'text'} ${isSelected ? 'selected' : ''}`}
                          style={isSwatch ? { backgroundColor: item.value } : undefined}
                          data-testid={testId}
                          onClick={() => {
                            if (!isSelected) {
                              updateCartItemAttributes(product.id, selectedAttributes, newAttributes);
                            }
                          }}
                          aria-pressed={isSelected}
                          title={item.displayValue}
                        >
                          {!isSwatch && item.displayValue}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="cart-item-right">
                <div className="cart-item-qty">
                  <button
                    type="button"
                    className="cart-item-qty-btn"
                    onClick={() => updateQuantity(product.id, selectedAttributes, 1)}
                    data-testid="cart-item-amount-increase"
                  >
                    +
                  </button>
                  <span className="cart-item-qty-num" data-testid="cart-item-amount">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="cart-item-qty-btn"
                    onClick={() => updateQuantity(product.id, selectedAttributes, -1)}
                    data-testid="cart-item-amount-decrease"
                  >
                    −
                  </button>
                </div>
                <img
                  src={
                    product.gallery?.[getGalleryIndexForProduct(product, selectedAttributes)] ??
                    product.gallery?.[0]
                  }
                  alt=""
                  className="cart-item-image"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="cart-overlay-footer">
          <div className="cart-total-row" data-testid="cart-total">
            <span>Total</span>
            <span>${Number(totalAmount).toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="cart-place-order"
            disabled={items.length === 0 || placing}
            onClick={handlePlaceOrder}
          >
            PLACE ORDER
          </button>
        </div>
      </aside>
    </>
  );
}
