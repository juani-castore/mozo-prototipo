const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="border-2 border-brick rounded-xl p-4 m-2 bg-white flex flex-col justify-between items-center shadow-lg hover:shadow-xl transition-all duration-200 motion-safe:hover:-translate-y-1">
      <h3 className="mb-2 text-brick font-black text-lg tracking-tight">
        {product.nombre}
      </h3>
      <p className="mb-4 text-gold font-black text-xl">
        ${product.precio}
      </p>
      <button
        className="px-4 py-2 bg-gold text-brick border-2 border-gold rounded-xl font-black hover:bg-white hover:shadow-lg transition-all duration-200 tracking-tight"
        onClick={onAddToCart}
      >
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductCard;
