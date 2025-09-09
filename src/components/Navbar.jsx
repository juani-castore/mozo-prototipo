import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú colapsable

  return (
    <nav className="bg-brick px-4 py-4 shadow-md border-b border-brick/10">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div>
          <img src={logo} alt="Logo Mozo" className="h-10" />
        </div>

        {/* Botón hamburguesa para dispositivos móviles */}
        <button
          className="text-gold md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Enlaces del navbar */}
        <div
          className={`flex-col md:flex-row md:flex ${
            isMenuOpen ? "flex" : "hidden"
          } md:gap-4 md:items-center`}
        >
          <Link
            to="/"
            className="text-gold text-sm font-bold px-4 py-2 border border-gold rounded-md hover:bg-gold hover:text-white transition"
          >
            Menú
          </Link>
          <Link
            to="/cart"
            className="text-gold text-sm font-bold px-4 py-2 border border-gold rounded-md hover:bg-gold hover:text-white transition"
          >
            Carrito
          </Link>
          <Link
            to="/restaurante"
            className="text-gold text-sm font-bold px-4 py-2 border border-gold rounded-md hover:bg-gold hover:text-white transition"
          >
            Restaurante
          </Link>
          <a
            href="https://mozo-phi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold text-sm font-bold px-4 py-2 border border-gold rounded-md hover:bg-gold hover:text-white transition"
          >
            MOZO
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
