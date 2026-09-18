import React, { useState, useEffect } from "react";
import "./products.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Ergonomic Wireless Mouse",
    category: "Peripherals",
    price: 1499,
    rating: 4.8,
    reviews: 128,
    icon: "🖱️",
    description: "4000 DPI optical sensor with silent click switches and dual Bluetooth/2.4G connectivity.",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    category: "Peripherals",
    price: 3899,
    rating: 4.9,
    reviews: 245,
    icon: "⌨️",
    description: "Compact 75% layout with hot-swappable tactile switches and per-key RGB backlighting.",
  },
  {
    id: 3,
    name: "Noise-Cancelling Headphones",
    category: "Audio",
    price: 6499,
    rating: 4.7,
    reviews: 89,
    icon: "🎧",
    description: "Active noise cancellation with 40-hour battery life and custom 40mm dynamic drivers.",
  },
  {
    id: 4,
    name: "USB-C Multiport Hub",
    category: "Accessories",
    price: 2199,
    rating: 4.6,
    reviews: 160,
    icon: "🔌",
    description: "8-in-1 adapter with 4K HDMI, 100W Power Delivery pass-through, SD card reader, and Gigabit LAN.",
  },
  {
    id: 5,
    name: "27-inch 4K IPS Monitor",
    category: "Displays",
    price: 21999,
    rating: 4.9,
    reviews: 73,
    icon: "🖥️",
    description: "UHD resolution with 99% sRGB color accuracy, HDR support, and height-adjustable pivot stand.",
  },
  {
    id: 6,
    name: "Aluminum Laptop Stand",
    category: "Accessories",
    price: 1299,
    rating: 4.8,
    reviews: 310,
    icon: "💻",
    description: "Ergonomic riser with open ventilation design for heat dissipation and silicone anti-slip grips.",
  },
  {
    id: 7,
    name: "Studio USB Microphone",
    category: "Audio",
    price: 3299,
    rating: 4.7,
    reviews: 95,
    icon: "🎙️",
    description: "Cardioid condenser mic with built-in pop filter, zero-latency monitoring, and quick tap-to-mute.",
  },
  {
    id: 8,
    name: "Desk Mat (900x400mm)",
    category: "Accessories",
    price: 799,
    rating: 4.5,
    reviews: 412,
    icon: "📐",
    description: "Water-resistant micro-woven cloth surface with reinforced stitched edges and non-slip rubber base.",
  },
];

const CATEGORIES = ["All", "Peripherals", "Audio", "Accessories", "Displays"];

export default function ProductsList() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedItem, setAddedItem] = useState(null);

  // Sync to cart across microfrontends
  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      icon: product.icon,
      category: product.category,
    };

    // 1. Dispatch custom event for real-time listeners (Host navbar & Cart MFE)
    window.dispatchEvent(new CustomEvent("add-to-cart", { detail: cartItem }));

    // 2. Persist to localStorage for cross-route resilience
    try {
      const storageKey = "mf-cart-items";
      const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
      const existingIdx = saved.findIndex((item) => item.id === product.id);

      let updated;
      if (existingIdx > -1) {
        updated = saved.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        updated = [...saved, { ...cartItem, quantity: 1, cartId: Date.now() }];
      }

      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: updated }));
    } catch (err) {
      console.error("Storage sync failed:", err);
    }

    // Temporary button state & toast feedback
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const filteredList = PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="products-view">
      <div className="catalog-header">
        <div className="title-group">
          <div className="heading-wrap">
            <h2>Product Catalog</h2>
            <span className="mfe-tag">Remote 3001</span>
          </div>
          <p className="subtitle">
            Browse our curated tech peripherals and workstation gear.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="catalog-grid">
        {filteredList.length === 0 ? (
          <div className="empty-catalog">
            <p>No products found matching "{search}".</p>
          </div>
        ) : (
          filteredList.map((product) => {
            const isAdded = addedItem === product.id;
            return (
              <div key={product.id} className="product-card">
                <div className="card-media">
                  <span className="category-badge">{product.category}</span>
                  <span className="product-icon">{product.icon}</span>
                  <div className="rating-badge">
                    <span>★ {product.rating}</span>
                    <span className="review-count">({product.reviews})</span>
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{product.name}</h3>
                  <p className="card-desc">{product.description}</p>

                  <div className="card-footer">
                    <div className="price-tag">
                      <span className="label">Price</span>
                      <span className="amount">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`btn-add ${isAdded ? "btn-success" : ""}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                    >
                      {isAdded ? "✓ Added" : "+ Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
