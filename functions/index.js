// functions/index.js
const functions = require("firebase-functions");
const mercadopago = require("mercadopago");

console.log("Redeploying...");

// Configura MercadoPago usando process.env (asegúrate de que MP_TOKEN esté definido en producción)
mercadopago.configure({
  access_token: process.env.MP_TOKEN,
});

exports.generarLinkDePago = functions.https.onCall(async (data, context) => {
  console.log("[DEBUG] Data received:", data);

  const { carrito, mesa } = data.data;

  console.log("[DEBUG] Carrito received:", carrito);
  console.log("[DEBUG] Is carrito an array?", Array.isArray(carrito));

  // Validate carrito
  if (!carrito || !Array.isArray(carrito)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El carrito es obligatorio y debe ser un arreglo."
    );
  }

  const preference = {
    items: carrito.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: "ARS",
    })),
    back_urls: {
        success: `${baseUrl}/order-confirmation`,
        failure: `${baseUrl}/payment-failed`,
        pending: `${baseUrl}/payment-pending`,
    },
    auto_return: "approved",
    metadata: { mesa },
  };

  console.log("[DEBUG] Preferencia a MercadoPago:", preference);

  try {
    const responseMP = await mercadopago.preferences.create(preference);
    console.log("[DEBUG] Respuesta de MercadoPago:", responseMP.body);
    return { init_point: responseMP.body.init_point };
  } catch (error) {
    console.error("[DEBUG] Error creando preferencia:", error.response ? error.response.data : error.message);
    throw new functions.https.HttpsError(
      "internal",
      "No se pudo crear el link de pago"
    );
  }
});
