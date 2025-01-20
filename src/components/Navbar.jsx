import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "var(--brick)",
        padding: "0.8rem 2rem",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div>
        <img
          src={logo}
          alt="Logo Mozo"
          style={{ height: "40px" }}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "var(--gold)",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "0.5rem 1rem",
            border: "1px solid var(--gold)",
            borderRadius: "5px",
            backgroundColor: "transparent",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Menú
        </Link>
        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            color: "var(--gold)",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "0.5rem 1rem",
            border: "1px solid var(--gold)",
            borderRadius: "5px",
            backgroundColor: "transparent",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Carrito
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
