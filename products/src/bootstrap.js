import React from "react";
import { createRoot } from "react-dom/client";
import ProductsList from "./ProductsList";

function StandaloneWrapper() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div className="standalone-banner">
        <div>
          <strong>Products Microfrontend</strong> running in <em>Standalone Mode</em>
        </div>
        <span className="standalone-pill">Port 3001</span>
      </div>
      <div style={{ padding: "2rem" }}>
        <ProductsList />
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<StandaloneWrapper />);
