import React from "react";
import { createRoot } from "react-dom/client";
import CartList from "./CartList";

function StandaloneWrapper() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div
        style={{
          background: "#fdf2f8",
          borderBottom: "1px solid #fbcfe8",
          padding: "0.75rem 1.5rem",
          color: "#9d174d",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div>
          <strong>Cart Microfrontend</strong> running in <em>Standalone Mode</em>
        </div>
        <span
          style={{
            background: "#db2777",
            color: "#ffffff",
            fontWeight: "700",
            padding: "0.2rem 0.5rem",
            borderRadius: "0.35rem",
            fontSize: "0.75rem",
          }}
        >
          Port 3002
        </span>
      </div>
      <div style={{ padding: "2rem" }}>
        <CartList />
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<StandaloneWrapper />);
