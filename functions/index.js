const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });
const baseUrl = "https://mozo-prototipo.vercel.app";
const MP_TOKEN = defineSecret("MP_TOKEN");

// ⚡ generarLinkDePago
exports.generarLinkDePago = onRequest({ secrets: [MP_TOKEN] }, async (req, res) => {
  corsHandler(req, res, async () => {
    console.log("Request received:", req.body);
    const token = MP_TOKEN.value();
    const mp = new MercadoPagoConfig({ accessToken: token });
    const preferenceApi = new Preference(mp);

    const { carrito, mesa, orderData } = req.body || {};
    if (!Array.isArray(carrito) || !orderData) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      const paymentId = uuidv4();
      const preferenceData = {
        items: carrito.map(item => ({
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
        external_reference: paymentId,
      };

      const response = await preferenceApi.create({ body: preferenceData });

      await db.collection("pendingOrders").doc(paymentId).set({
        orderData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ init_point: response.init_point, paymentId });
    } catch (err) {
      console.error("Error creando preferencia:", err);
      res.status(500).json({ error: err.message || "Error interno" });
    }
  });
});

// ⚡ confirmarPago
exports.confirmarPago = onRequest({ secrets: [MP_TOKEN] }, async (req, res) => {
  corsHandler(req, res, async () => {
    const token = MP_TOKEN.value();
    const mp = new MercadoPagoConfig({ accessToken: token });
    const paymentApi = new Payment(mp);

    const { payment_id, orderData } = req.body || {};
    if (!payment_id || !orderData) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    try {
      const pago = await paymentApi.get({ id: payment_id });
      if (pago.status !== "approved") {
        return res.status(400).json({ error: `Estado del pago: ${pago.status}` });
      }

      const result = await guardarPedido(payment_id, orderData);
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error confirmando pago:", err);
      return res.status(500).json({ error: "Error interno al confirmar pago" });
    }
  });
});

// ⚡ webhookPago
exports.webhookPago = onRequest({ secrets: [MP_TOKEN] }, async (req, res) => {
  corsHandler(req, res, async () => {
    const paymentId = req.body.data?.id;
    if (!paymentId) return res.status(400).send("Falta ID");

    try {
      const token = MP_TOKEN.value();
      const mp = new MercadoPagoConfig({ accessToken: token });
      const paymentApi = new Payment(mp);

      const pago = await paymentApi.get({ id: paymentId });
      if (pago.status !== "approved") return res.status(200).send("No aprobado");

      const ref = pago.external_reference;
      const doc = await db.collection("pendingOrders").doc(ref).get();
      if (!doc.exists) return res.status(404).send("Pedido no encontrado");

      const orderData = doc.data().orderData;
      await guardarPedido(paymentId, orderData);
      await db.collection("pendingOrders").doc(ref).delete();

      return res.status(200).send("OK");
    } catch (err) {
      console.error("Error en webhook:", err);
      return res.status(500).send("Error");
    }
  });
});

// 🧾 guardarPedido
async function guardarPedido(paymentId, orderData) {
  const counterRef = db.collection("counters").doc("orders");
  const counterSnap = await counterRef.get();
  const newOrderId = counterSnap.exists ? counterSnap.data().lastId + 1 : 1;
  await counterRef.set({ lastId: newOrderId });

  const { name, email, pickupTime, comments, cart } = orderData;
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  await db.collection("orders").add({
    orderId: newOrderId,
    name,
    email,
    pickupTime,
    comments,
    total,
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    timeSubmitted: admin.firestore.FieldValue.serverTimestamp(),
    printed: false,
    paymentId,
  });

  return { orderId: newOrderId };
}
