# React Microfrontend Architecture Demo

A practical microfrontend implementation built with React 18 and Webpack 5 Module Federation.

This project demonstrates how three independent React applications can be composed at runtime:
1. **Host App** (`http://localhost:3000`): The shell/container application providing routing, navigation, and live cart counter.
2. **Products App** (`http://localhost:3001`): Remote microfrontend exposing the product catalog component (`./ProductsList`).
3. **Cart App** (`http://localhost:3002`): Remote microfrontend exposing the cart management component (`./CartList`).

---

## Architecture & Communication

### 1. Webpack Module Federation
- All three applications configure Webpack's `ModuleFederationPlugin`.
- The **Host** dynamically imports `products/ProductsList` and `cart/CartList` at runtime using `React.lazy()` and `Suspense`.
- Common dependencies (`react`, `react-dom`, `react-router-dom`) are declared as shared singletons (`singleton: true`) across all apps to prevent multiple React runtime instances.

### 2. State & Cross-App Events
- **Pub/Sub Event Bus**: `ProductsList` dispatches a standard browser `CustomEvent` (`add-to-cart`) when a user adds an item.
- **Listeners**: The `CartList` remote and the Host navbar listen for `add-to-cart` and `cart-updated` events to update state and badge counts in real time.
- **Persistence**: Cart items are backed up in `localStorage` (`mf-cart-items`), keeping state preserved during route transitions or page refreshes.

### 3. Standalone Execution
Both `products` and `cart` remotes can be run and tested standalone:
- Products: `http://localhost:3001`
- Cart: `http://localhost:3002`

---

## Quick Start

### 1. Install Dependencies
```bash
# Install root orchestration tools and all app dependencies
npm run install:all
```

*(Alternatively, run `npm install` inside `products`, `cart`, and `host` directories).*

### 2. Run the Applications
```bash
# Start all 3 microfrontends concurrently
npm start
```

This starts:
- Host container on **http://localhost:3000**
- Products remote on **http://localhost:3001**
- Cart remote on **http://localhost:3002**

---

## Manual Step-by-Step Run

If you want to run each service in a separate terminal:

```bash
# Terminal 1 - Products (Port 3001)
cd products
npm start

# Terminal 2 - Cart (Port 3002)
cd cart
npm start

# Terminal 3 - Host (Port 3000)
cd host
npm start
```

---

## Key Features

- **Dynamic Loading & Routing**: Client-side routing with React Router v6 (`/products` and `/cart`).
- **Resilient Fallbacks**: Error boundaries and suspense loading skeletons for handling remote latency or disconnects.
- **Interactive Catalog**: Category filters, real-time search, ratings, and pricing in INR.
- **Cart Management**: Quantity controls (`+` / `-`), item removal, clear cart, coupon discount (`VERSIONNEXT10`), and simulated checkout modal.

---

## Project Structure

```
microfrontend-demo/
├── package.json              # Root scripts (install:all, start with concurrently)
├── README.md                 # Project documentation
├── host/                     # Container App (Port 3000)
│   ├── webpack.config.js     # Module Federation remotes config
│   └── src/
│       ├── App.js            # Navbar, routing, badge count, error boundary
│       ├── host.css
│       └── bootstrap.js
├── products/                 # Products Remote (Port 3001)
│   ├── webpack.config.js     # Exposes ./ProductsList
│   └── src/
│       ├── ProductsList.js   # Catalog, category filtering, search, add-to-cart
│       ├── products.css
│       └── bootstrap.js
└── cart/                     # Cart Remote (Port 3002)
    ├── webpack.config.js     # Exposes ./CartList
    └── src/
        ├── CartList.js       # Cart items, quantity controls, coupon, checkout
        ├── cart.css
        └── bootstrap.js
```

---

## Author

- **Sahil Sawant** ([@Sahil1678](https://github.com/Sahil1678))
- Email: sahilsawant064@gmail.com
