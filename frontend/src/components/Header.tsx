import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

interface HeaderProps {
  onCartClick: () => void;
}

const categories = [
  { name: 'all', path: '/all' },
  { name: 'clothes', path: '/clothes' },
  { name: 'tech', path: '/tech' },
];

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeCategory =
    pathname === '/' ? 'all' : pathname.replace(/^\//, '') || 'all';

  const linkClass = (name: string) =>
    `header-link ${activeCategory === name ? 'active' : ''}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header" data-testid="header">
      <button
        type="button"
        className={`header-menu-btn ${menuOpen ? 'header-menu-btn-open' : ''}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span className="header-menu-icon" />
      </button>
      <nav className="header-nav" aria-hidden={menuOpen}>
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.path}
            className={linkClass(cat.name)}
            data-testid={activeCategory === cat.name ? 'active-category-link' : 'category-link'}
          >
            {cat.name.toUpperCase()}
          </Link>
        ))}
      </nav>
      <div className="header-logo">
        <Link to="/all" aria-label="Home" onClick={closeMenu}>
          <span className="logo-icon" />
        </Link>
      </div>
      <button
        type="button"
        className="header-cart"
        onClick={onCartClick}
        aria-label="Cart"
        data-testid="cart-btn"
      >
        <span className="cart-icon" />
        {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
      </button>

      <div
        className={`header-mobile-menu ${menuOpen ? 'header-mobile-menu-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Category menu"
      >
        <div className="header-mobile-menu-backdrop" onClick={closeMenu} />
        <div className="header-mobile-menu-panel">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className={linkClass(cat.name)}
              data-testid={activeCategory === cat.name ? 'active-category-link' : 'category-link'}
              onClick={closeMenu}
            >
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
