const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const mercadopago = require("mercadopago");

// 🔐 Token guardado como secreto en Firebase
const MP_ACCESS_TOKEN = defineSecret("MP_ACCESS_TOKEN");

// 🛒 Función callable para generar link de pago con Mercado Pago
exports.generarLinkDePago = onCall({ secrets: [MP_ACCESS_TOKEN] }, async (data, context) => {

  //console.log("✅ Payload recibido:", JSON.stringify(data?.data || {}, null, 2));


  const payload = data?.data || {};
  const { nombre, email, carrito } = payload;


  //console.log("📦 Datos recibidos:", { nombre, email, carrito });

  if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
    console.error("❌ Carrito inválido:", carrito);
    throw new Error("El carrito está vacío o mal formado.");
  }

  mercadopago.configure({
    access_token: MP_ACCESS_TOKEN.value(),
  });

  const items = carrito.map((item) => ({
    title: item.nombre,
    quantity: Number(item.quantity),
    unit_price: Number(item.precio),
    currency_id: "ARS",
  }));

  console.log("🧾 Items enviados a Mercado Pago:", items);

  try {
    const preference = await mercadopago.preferences.create({
      items,
      payer: { name: nombre, email },
      back_urls: {
        success: "http://localhost:5173/order-confirmation",
        failure: "http://localhost:5173/payment-failed",
        pending: "http://localhost:5173/payment-pending",
      },
      auto_return: "approved",
    });

    console.log("✅ Preferencia creada:", preference.body.id);
    return { init_point: preference.body.init_point };
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error?.message || error);
    throw new Error("No se pudo generar el link de pago.");
  }
});
