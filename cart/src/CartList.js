import React, { useState, useEffect } from "react";
import "./cart.css";

const STORAGE_KEY = "mf-cart-items";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read localStorage:", err);
    return [];
  }
}

function writeStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: items }));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
}

export default function CartList() {
  const [items, setItems] = useState(readStorage);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Subscribe to external add-to-cart & cart-updated events
  useEffect(() => {
    const onAddToCart = (event) => {
      const incoming = event.detail;
      setItems((prev) => {
        const idx = prev.findIndex((item) => item.id === incoming.id);
        let next;
        if (idx > -1) {
          next = prev.map((item, i) =>
            i === idx ? { ...item, quantity: (item.quantity || 1) + 1 } : item
          );
        } else {
          next = [
            ...prev,
            {
              ...incoming,
              quantity: incoming.quantity || 1,
              cartId: Date.now() + Math.random(),
            },
          ];
        }
        writeStorage(next);
        return next;
      });
    };

    const onCartUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setItems(event.detail);
      }
    };

    window.addEventListener("add-to-cart", onAddToCart);
    window.addEventListener("cart-updated", onCartUpdated);

    return () => {
      window.removeEventListener("add-to-cart", onAddToCart);
      window.removeEventListener("cart-updated", onCartUpdated);
    };
  }, []);

  const handleQuantity = (cartId, delta) => {
    setItems((prev) => {
      const next = prev
        .map((item) => {
          if (item.cartId === cartId || item.id === cartId) {
            const nextQty = (item.quantity || 1) + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      writeStorage(next);
      return next;
    });
  };

  const handleRemove = (cartId) => {
    setItems((prev) => {
      const next = prev.filter(
        (item) => item.cartId !== cartId && item.id !== cartId
      );
      writeStorage(next);
      return next;
    });
  };

  const handleClear = () => {
    setItems([]);
    writeStorage([]);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "VERSIONNEXT10") {
      setDiscount(10);
      setCouponError("");
    } else {
      setCouponError("Invalid promo code. Try VERSIONNEXT10");
    }
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const discountAmount = Math.round((subtotal * discount) / 100);
  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const total = subtotal - discountAmount + tax;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="cart-view">
      <div className="cart-header">
        <div className="title-row">
          <div>
            <div className="heading-wrap">
              <h2>Shopping Cart</h2>
              <span className="mfe-tag cart-tag">Remote 3002</span>
            </div>
            <p className="subtitle">
              Manage your items and proceed to checkout.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              className="btn-clear"
              onClick={handleClear}
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart-card">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>
            Browse the product catalog to add peripherals and accessories to
            your cart.
          </p>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Item List */}
          <div className="cart-items-card">
            <ul className="cart-list">
              {items.map((item) => {
                const itemKey = item.cartId || item.id;
                const qty = item.quantity || 1;
                const itemTotal = item.price * qty;

                return (
                  <li key={itemKey} className="cart-item">
                    <div className="item-icon-wrap">{item.icon || "📦"}</div>

                    <div className="item-details">
                      <span className="item-cat">{item.category}</span>
                      <h4 className="item-name">{item.name}</h4>
                      <span className="item-unit-price">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </span>
                    </div>

                    <div className="item-actions">
                      <div className="qty-picker">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQuantity(itemKey, -1)}
                        >
                          -
                        </button>
                        <span className="qty-val">{qty}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQuantity(itemKey, 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="item-total-price">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </div>

                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemove(itemKey)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Summary */}
          <div className="summary-card">
            <h3 className="summary-heading">Order Summary</h3>

            <div className="summary-row">
              <span>Items ({itemCount})</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹{tax.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-text">FREE</span>
            </div>

            <div className="summary-divider"></div>

            {/* Promo Code */}
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <div className="coupon-input-group">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button type="submit" className="coupon-btn">
                  Apply
                </button>
              </div>
              <span className="coupon-tip">Use code VERSIONNEXT10 for 10% off</span>
              {couponError && (
                <span className="coupon-error">{couponError}</span>
              )}
            </form>

            <div className="summary-total-row">
              <span className="total-label">Total</span>
              <span className="total-amount">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <h3>Order Placed Successfully</h3>
            <p>
              Thank you for testing the microfrontend application. Total amount:{" "}
              <strong>₹{total.toLocaleString("en-IN")}</strong>.
            </p>
            <button
              type="button"
              className="btn-modal-close"
              onClick={() => {
                handleClear();
                setIsCheckoutOpen(false);
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
