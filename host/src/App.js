import React, { Suspense, lazy, useState, useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./host.css";

// Lazy-loaded remote components via Webpack Module Federation
const ProductsList = lazy(() => import("products/ProductsList"));
const CartList = lazy(() => import("cart/CartList"));

// Standard Error Boundary for remote failure fallback
class RemoteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(`[MFE Error] Failed to load remote: ${this.props.name}`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mfe-error-card">
          <div className="error-icon">⚠️</div>
          <h3>{this.props.name} Unavailable</h3>
          <p>
            Could not connect to <code>{this.props.url}</code>. Make sure the remote
            service is running.
          </p>
          <button
            type="button"
            className="btn-retry"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <div className="loading-state">
      <div className="skeleton-bar title-skeleton"></div>
      <div className="skeleton-grid">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    </div>
  );
}

function Navbar({ cartCount }) {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <NavLink to="/products" className="brand">
          <div className="brand-logo">⚡</div>
          <div className="brand-text">
            <span className="brand-title">VersionNext</span>
            <span className="brand-sub">Microfrontend Store</span>
          </div>
        </NavLink>

        <nav className="nav-menu">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span>🛍️</span> Products
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span>🛒</span> Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>

      <div className="status-strip">
        <div className="status-strip-inner">
          <span>Host Container (Port 3000)</span>
          <div className="status-tags">
            <span className="status-tag">
              <span className="dot"></span> Products: 3001
            </span>
            <span className="status-tag">
              <span className="dot"></span> Cart: 3002
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [cartCount, setCartCount] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem("mf-cart-items")) || [];
      return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch {
      return 0;
    }
  });

  // Keep cart item count in sync with microfrontend events
  useEffect(() => {
    const syncCount = () => {
      try {
        const items = JSON.parse(localStorage.getItem("mf-cart-items")) || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (e) {
        console.warn("Cart count sync error:", e);
      }
    };

    const handleAdd = () => setTimeout(syncCount, 50);

    window.addEventListener("add-to-cart", handleAdd);
    window.addEventListener("cart-updated", syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener("add-to-cart", handleAdd);
      window.removeEventListener("cart-updated", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar cartCount={cartCount} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route
              path="/products"
              element={
                <RemoteErrorBoundary
                  name="Products Remote"
                  url="http://localhost:3001"
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <ProductsList />
                  </Suspense>
                </RemoteErrorBoundary>
              }
            />
            <Route
              path="/cart"
              element={
                <RemoteErrorBoundary
                  name="Cart Remote"
                  url="http://localhost:3002"
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <CartList />
                  </Suspense>
                </RemoteErrorBoundary>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <span>© 2026 Version Next Technologies — React Microfrontend Architecture</span>
            <span>Webpack 5 Module Federation</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
