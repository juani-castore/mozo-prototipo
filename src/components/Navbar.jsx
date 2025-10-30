import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-brick to-brick shadow-xl border-b-2 border-gold/20">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo Pickup" className="h-9 md:h-10 drop-shadow-lg" />
          </Link>

          {/* Botón hamburguesa (mobile) */}
          <button
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            className="md:hidden rounded-xl p-2 text-gold hover:bg-white/10 hover:text-gold transition-all border-2 border-transparent hover:border-gold/40"
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
              to="/"
              className="px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 bg-white/0 hover:bg-white/10 transition-all tracking-tight"
            >
              Menú
            </Link>
            <Link
              to="/cart"
              className="px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 bg-white/0 hover:bg-white/10 transition-all tracking-tight"
            >
              Carrito
            </Link>
            <Link
              to="/restaurante"
              className="px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 bg-white/0 hover:bg-white/10 transition-all tracking-tight"
            >
              Restaurante
            </Link>
            <a
              href="https://mozo-phi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-black text-brick bg-gold hover:bg-white hover:text-brick rounded-xl shadow-lg hover:shadow-xl transition-all tracking-tight border-2 border-gold"
            >
              PICKUP
            </a>
          </div>
        </div>

        {/* Enlaces (mobile dropdown) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            isMenuOpen ? "max-h-96 mt-3" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-white/5 p-3 backdrop-blur border-2 border-white/10">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 hover:bg-white/10 transition-all tracking-tight"
            >
              Menú
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 hover:bg-white/10 transition-all tracking-tight"
            >
              Carrito
            </Link>
            <Link
              to="/restaurante"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-black text-gold hover:text-white rounded-xl border-2 border-gold/40 hover:border-white/40 hover:bg-white/10 transition-all tracking-tight"
            >
              Restaurante
            </Link>
            <a
              href="https://mozo-phi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-2 text-sm font-black text-brick bg-gold hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all tracking-tight border-2 border-gold"
            >
              PICKUP
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
