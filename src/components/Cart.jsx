import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handleIncrease = (productId) => {
    const product = cart.find((item) => item.id === productId);
    updateQuantity(productId, product.quantity + 1);
  };

  const handleDecrease = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (product.quantity > 1) {
      updateQuantity(productId, product.quantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const generateOrderId = () => {
    const palabras = [
      "sol", "luna", "estrella", "mar", "tierra", "viento", "fuego",
      "agua", "nube", "montaña", "río", "bosque", "cielo", "flor", "piedra",
      "árbol", "hoja", "raíz", "roca", "lluvia", "trueno", "nieve", "tormenta",
      "arena", "costa", "playa", "olas", "desierto", "isla", "valle", "pradera",
      "pájaro", "pez", "tigre", "león", "lobo", "oso", "ciervo", "águila", "zorro",
      "camino", "sendero", "puente", "ciudad", "aldea", "puerto", "torre", "castillo",
      "cabaña", "cueva", "faro", "barco", "velero", "tren", "avión", "camión",
      "coche", "bicicleta", "carro", "motor", "puerta", "ventana", "techo", "pared",
      "suelo", "mesa", "silla", "espejo", "cama", "almohada", "lámpara", "fuego",
      "humo", "chispas", "cuchillo", "plato", "vaso", "taza", "cubierto", "fresa",
      "manzana", "pera", "uva", "plátano", "naranja", "limón", "melón", "sandía",
      "cereza", "durazno", "mango", "piña", "coco", "almendra", "nuez", "avellana",
      "guitarra", "piano", "violín", "batería", "arpa", "flauta", "maraca", "tambor",
      "campana", "notas", "música", "canción", "melodía", "ritmo", "invierno",
      "primavera", "verano", "otoño", "amanecer", "atardecer", "noche", "día",
      "sombra", "luz", "color", "rojo", "azul", "verde", "amarillo", "naranja",
      "morado", "negro", "blanco", "gris", "marrón", "dorado", "plata", "rosa",
      "celeste", "beige", "turquesa", "lavanda", "ocre", "vino", "magenta", "índigo",
      "girasol", "tulipán", "orquídea", "lirio", "dalia", "azucena", "clavel",
      "jazmín", "violeta", "margarita", "hibisco", "mariposa", "abeja", "libélula",
      "escarabajo", "araña", "hormiga", "grillo", "mosquito", "saltamontes", "caracol",
      "lagartija", "serpiente", "rana", "sapo", "cocodrilo", "caballo", "gato",
      "perro", "conejo", "ardilla", "ratón", "tortuga", "delfín", "ballena", "tiburón",
      "estrella", "galaxia", "planeta", "cometa", "eclipse", "satélite", "constelación",
      "universo", "nave", "meteorito", "asteroide", "aurora", "polvo", "trigo", "maíz",
      "arroz", "avena", "quinoa", "cebada", "frijol", "lenteja", "soja", "espiga",
      "césped", "campo", "prado", "corazón", "sonrisa", "amigo", "familia", "paz",
      "alegría", "felicidad", "esperanza", "sueño", "luz", "fuerza", "valentía",
      "gratitud", "amor", "abrazo", "calor", "libertad", "volcán", "lava", "ceniza",
      "huracán", "terremoto", "paz", "destino", "viaje", "aventura", "cultura",
      "idioma", "arte", "historia", "pintura", "escultura", "danza", "teatro",
      "literatura", "poesía", "filosofía", "ciudad", "nación", "país", "planeta"
    ];

    return palabras[Math.floor(Math.random() * palabras.length)];
  };

  const handleSendOrder = () => {
    const phoneNumber = "5493814023228"; // Reemplaza con el número del restaurante
    const orderId = generateOrderId();
    const orderDetails = cart
      .map(
        (item) =>
          `- ${item.nombre} x ${item.quantity} ($${item.precio * item.quantity})`
      )
      .join("\n");
    const total = calculateTotal();
    const message = `Hola, quiero realizar el siguiente pedido:\n\n${orderDetails}\n\nTotal: $${total}\n\nMi identificador de pedido es: ${orderId}\n\nGracias.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container">
      <h2>Carrito</h2>
      {cart.length > 0 ? (
        cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              border: "1px solid var(--brick)",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <span>
              {item.nombre} x {item.quantity}
            </span>
            <div>
              <button onClick={() => handleDecrease(item.id)}>-</button>
              <button onClick={() => handleIncrease(item.id)}>+</button>
            </div>
          </div>
        ))
      ) : (
        <p>Tu carrito está vacío.</p>
      )}
      {cart.length > 0 && (
        <>
          <h3>Total: ${calculateTotal()}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
            <Link to="/checkout">
              <button>Ir a pagar</button>
            </Link>
            <button
              onClick={clearCart}
              style={{
                backgroundColor: "var(--brick)",
                color: "var(--white)",
                border: "none",
                padding: "0.7rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
              }}
            >
              Limpiar carrito
            </button>
            <button
              onClick={handleSendOrder}
              style={{
                backgroundColor: "var(--gold)",
                color: "var(--white)",
                border: "none",
                padding: "0.7rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
              }}
            >
              Enviar pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
