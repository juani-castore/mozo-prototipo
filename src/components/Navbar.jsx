import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-brick px-8 py-4 shadow-md">
      <div>
        <img src={logo} alt="Logo Mozo" className="h-10" />
      </div>
      <div className="flex gap-4">
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
        <a
          href="https://mozo-phi.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold text-sm font-bold px-4 py-2 border border-gold rounded-md hover:bg-gold hover:text-white transition"
        >
          MOZO
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
