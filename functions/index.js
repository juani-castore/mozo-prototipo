const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const mercadopago = require("mercadopago");
const { Preference } = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

function getAccessToken() {
  const token = process.env.MP_TOKEN;
  if (!token) throw new Error("MP_TOKEN no configurado");
  return token;
}

async function guardarPedido(paymentId, orderData) {
  const orderId = uuidv4();
  await db.collection("orders").add({
    orderId,
    paymentId,
    ...orderData,
    status: "approved",
    timeSubmitted: new Date(),
    printed: false,
  });
  return { success: true, orderId };
}

exports.generarLinkDePago = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { carrito, mesa, orderData } = req.body || {};

    logger.log("Request received:", req.body);

    if (!Array.isArray(carrito) || typeof mesa !== "string") {
      logger.error("Datos inválidos", { carrito, mesa });
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const access_token = getAccessToken();
    mercadopago.configurations.setAccessToken(access_token);

    const preference = {
      items: carrito.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        currency_id: "ARS",
      })),
      back_urls: {
        success: "https://mozo-prototipo.vercel.app/order-confirmation",
        failure: "https://mozo-prototipo.vercel.app/payment-failed",
        pending: "https://mozo-prototipo.vercel.app/payment-pending",
      },
      auto_return: "approved",
      metadata: { mesa },
      external_reference: uuidv4(),
    };

    logger.log("Preference created:", preference);

    try {
      const preferenceClient = new Preference();
      const response = await preferenceClient.create(preference);

      if (orderData) {
        await db.collection("pendingOrders").doc(preference.external_reference).set({
          orderData,
          createdAt: new Date(),
        });
      }

      return res.status(200).json({ init_point: response.init_point });
    } catch (err) {
      logger.error("Error creating payment link:", err);
      return res.status(500).json({ error: "Error generando link de pago" });
    }
  });
});

exports.confirmarPago = onCall(async (req) => {
  const { payment_id, orderData } = req.data || {};
  if (!payment_id || !orderData) {
    throw new Error("Datos incompletos.");
  }

  const access_token = getAccessToken();
  mercadopago.configurations.setAccessToken(access_token);

  try {
    const pago = await mercadopago.payment.findById(payment_id);
    if (pago.body.status !== "approved") {
      throw new Error(`Estado: ${pago.body.status}`);
    }

    return await guardarPedido(payment_id, orderData);
  } catch (err) {
    logger.error("Confirmar pago:", err);
    throw new Error("Error verificando pago.");
  }
});

exports.webhookPago = onRequest((req, res) => {
  cors(req, res, async () => {
    const paymentId = req.body.data?.id;
    if (!paymentId) return res.status(400).send("Falta ID");

    try {
      const access_token = getAccessToken();
      mercadopago.configurations.setAccessToken(access_token);

      const pago = await mercadopago.payment.findById(paymentId);
      const status = pago.body.status;
      const reference = pago.body.external_reference;

      if (status !== "approved") return res.status(200).send("Pago no aprobado");

      const doc = await db.collection("pendingOrders").doc(reference).get();
      if (!doc.exists) return res.status(404).send("Pedido no encontrado");

      const orderData = doc.data().orderData;
      await guardarPedido(paymentId, orderData);
      await db.collection("pendingOrders").doc(reference).delete();

      return res.status(200).send("OK");
    } catch (err) {
      logger.error("Webhook error:", err);
      return res.status(500).send("Error");
    }
  });
});

exports.callbackMP = onRequest((req, res) => {
  return res.redirect("https://mozo-prototipo.vercel.app/order-confirmation");
});
