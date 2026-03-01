import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { Product, CartItem } from '../types';

const CART_KEY = 'scandiweb_cart';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; payload: { product: Product; selectedAttributes: Record<string, string>; quantity: number } }
  | { type: 'REMOVE'; payload: { productId: string; selectedAttributes: Record<string, string> } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedAttributes: Record<string, string>; delta: number } }
  | { type: 'UPDATE_ATTRIBUTES'; payload: { productId: string; oldAttributes: Record<string, string>; newAttributes: Record<string, string> } }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { product, selectedAttributes, quantity = 1 } = action.payload;
      const existing = state.items.find(
        (i) =>
          i.product.id === product.id &&
          JSON.stringify(i.selectedAttributes) === JSON.stringify(selectedAttributes || {})
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product, selectedAttributes: selectedAttributes || {}, quantity }],
      };
    }
    case 'REMOVE': {
      const { productId, selectedAttributes } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.product.id === productId &&
              JSON.stringify(i.selectedAttributes) === JSON.stringify(selectedAttributes || {})
            )
        ),
      };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, selectedAttributes, delta } = action.payload;
      return {
        ...state,
        items: state.items
          .map((i) => {
            if (
              i.product.id !== productId ||
              JSON.stringify(i.selectedAttributes) !== JSON.stringify(selectedAttributes || {})
            )
              return i;
            const q = i.quantity + delta;
            if (q <= 0) return null;
            return { ...i, quantity: q };
          })
          .filter((x): x is CartItem => x !== null),
      };
    }
    case 'UPDATE_ATTRIBUTES': {
      const { productId, oldAttributes, newAttributes } = action.payload;
      const oldKey = JSON.stringify(oldAttributes);
      const newKey = JSON.stringify(newAttributes);
      if (oldKey === newKey) return state;
      const current = state.items.find(
        (i) => i.product.id === productId && JSON.stringify(i.selectedAttributes) === oldKey
      );
      if (!current) return state;
      const existingWithNew = state.items.find(
        (i) => i.product.id === productId && JSON.stringify(i.selectedAttributes) === newKey
      );
      if (existingWithNew) {
        return {
          ...state,
          items: state.items
            .filter((i) => i !== current)
            .map((i) =>
              i === existingWithNew
                ? { ...i, quantity: i.quantity + current.quantity }
                : i
            ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i === current ? { ...i, selectedAttributes: newAttributes } : i
        ),
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, selectedAttributes: Record<string, string>, quantity?: number) => void;
  removeFromCart: (productId: string, selectedAttributes: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedAttributes: Record<string, string>, delta: number) => void;
  updateCartItemAttributes: (productId: string, oldAttributes: Record<string, string>, newAttributes: Record<string, string>) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[] };
        if (parsed?.items?.length) {
          dispatch({ type: 'CLEAR' });
          parsed.items.forEach(({ product, selectedAttributes, quantity }) => {
            dispatch({ type: 'ADD', payload: { product, selectedAttributes, quantity } });
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ items: state.items }));
    } catch {
      // ignore
    }
  }, [state.items]);

  const addToCart = useCallback(
    (product: Product, selectedAttributes: Record<string, string>, quantity = 1) => {
      dispatch({ type: 'ADD', payload: { product, selectedAttributes, quantity } });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, selectedAttributes: Record<string, string>) => {
    dispatch({ type: 'REMOVE', payload: { productId, selectedAttributes } });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, selectedAttributes: Record<string, string>, delta: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedAttributes, delta } });
    },
    []
  );

  const updateCartItemAttributes = useCallback(
    (productId: string, oldAttributes: Record<string, string>, newAttributes: Record<string, string>) => {
      dispatch({ type: 'UPDATE_ATTRIBUTES', payload: { productId, oldAttributes, newAttributes } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = state.items.reduce((s, i) => {
    const price = i.product.prices?.[0];
    return s + (price ? price.amount * i.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItemAttributes,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
