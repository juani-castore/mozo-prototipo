import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-pickap-gray-dark/10">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/fud/menu" className="flex items-center gap-2">
            <img src={logo} alt="Logo Pickap" className="h-9 md:h-10" />
          </Link>

          {/* Botón hamburguesa (mobile) */}
          <button
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            className="md:hidden rounded-xl p-2 text-pickap-black hover:bg-pickap-gray transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Enlaces (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/fud/menu"
              className="px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-pickap-gray rounded-xl transition-all"
            >
              Menú
            </Link>
            <Link
              to="/fud/cart"
              className="px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-pickap-gray rounded-xl transition-all"
            >
              Carrito
            </Link>
            <Link
              to="/fud/restaurante"
              className="px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-pickap-gray rounded-xl transition-all"
            >
              Restaurante
            </Link>
            <a
              href="https://mozo-phi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-bold text-pickap-black bg-pickap-yellow hover:bg-pickap-yellow/90 rounded-xl shadow-sm hover:shadow transition-all"
            >
              Pickap
            </a>
          </div>
        </div>

        {/* Enlaces (mobile dropdown) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            isMenuOpen ? "max-h-96 mt-3" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-pickap-gray p-3">
            <Link
              to="/fud/menu"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-white rounded-xl transition-all"
            >
              Menú
            </Link>
            <Link
              to="/fud/cart"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-white rounded-xl transition-all"
            >
              Carrito
            </Link>
            <Link
              to="/fud/restaurante"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-semibold text-pickap-black hover:bg-white rounded-xl transition-all"
            >
              Restaurante
            </Link>
            <a
              href="https://mozo-phi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-bold text-pickap-black bg-pickap-yellow hover:bg-pickap-yellow/90 rounded-xl shadow-sm transition-all"
            >
              Pickap
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
