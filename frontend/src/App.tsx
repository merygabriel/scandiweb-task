import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartOverlay from './components/CartOverlay';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import './App.css';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!orderSuccess) return;
    const t = setTimeout(() => setOrderSuccess(false), 4000);
    return () => clearTimeout(t);
  }, [orderSuccess]);

  return (
    <CartProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app">
          <Header onCartClick={() => setCartOpen(true)} />
          <main className={cartOpen ? 'main dimmed' : 'main'}>
            <Routes>
              <Route path="/" element={<Navigate to="/all" replace />} />
              <Route path="/all" element={<CategoryPage />} />
              <Route path="/clothes" element={<CategoryPage />} />
              <Route path="/tech" element={<CategoryPage />} />
              <Route
                path="/product/:productId"
                element={<ProductPage onAddToCartOpenCart={() => setCartOpen(true)} />}
              />
            </Routes>
          </main>
          {cartOpen && (
            <CartOverlay
              onClose={() => setCartOpen(false)}
              onBackdropClick={() => setCartOpen(false)}
              onOrderSuccess={() => {
                setOrderSuccess(true);
                setCartOpen(false);
              }}
            />
          )}
          {orderSuccess && (
            <div className="order-success-toast" role="status" aria-live="polite">
              <span className="order-success-icon">✓</span>
              Order placed successfully!
            </div>
          )}
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
