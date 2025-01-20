import React from "react";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div
      style={{
        border: "1px solid var(--brick)",
        borderRadius: "8px",
        padding: "1rem",
        margin: "0.5rem",
        backgroundColor: "var(--white)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3 style={{ marginBottom: "0.5rem", color: "var(--brick)" }}>
        {product.nombre}
      </h3>
      <p style={{ marginBottom: "1rem", color: "var(--gold)" }}>
        ${product.precio}
      </p>
      <button
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "var(--gold)",
          border: "none",
          borderRadius: "5px",
          color: "white",
          cursor: "pointer",
        }}
        onClick={onAddToCart}
      >
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductCard;
