const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const mercadopago = require("mercadopago");

const MP_ACCESS_TOKEN = defineSecret("MP_ACCESS_TOKEN");
const FRONTEND_BASE_URL = defineSecret("FRONTEND_BASE_URL");

exports.generarLinkDePago = onCall(
  { secrets: [MP_ACCESS_TOKEN, FRONTEND_BASE_URL] },
  async (data, context) => {
    const payload = data?.data || {};
    const { nombre, email, carrito } = payload;

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

    const baseUrl = FRONTEND_BASE_URL.value();
    console.log("🌐 baseUrl usado:", baseUrl); // ✅ ahora sí funciona

    try {
      const preference = await mercadopago.preferences.create({
        items,
        payer: { name: nombre, email },
        back_urls: {
          success: `${baseUrl}/order-confirmation`,
          failure: `${baseUrl}/payment-failed`,
          pending: `${baseUrl}/payment-pending`,
        },
        auto_return: "approved",
      });

      console.log("✅ Preferencia creada:", preference.body.id);
      return { init_point: preference.body.init_point };
    } catch (error) {
      console.error("❌ Error al crear preferencia:", error?.message || error);
      throw new Error("No se pudo generar el link de pago.");
    }
  }
);
