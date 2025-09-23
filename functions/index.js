const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();

const MP_TOKEN = defineSecret("MP_TOKEN");

const oldBaseUrl = "https://mozo-prototipo.vercel.app"; // Cambiar a tu dominio
const baseUrl = "https://mozo.app"; // Cambiar a tu dominio

// Configurar CORS

const corsHandler = cors({ origin: true });

// 🧾 guarda el pedido confirmado en /orders y elimina de /pendingOrders
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

// ⚡ generarLinkDePago
exports.generarLinkDePago = onRequest({ secrets: [MP_TOKEN] }, async (req, res) => {
  corsHandler(req, res, async () => {
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
      res.status(500).json({ error: "Error interno" });
    }
  });
});

// ⚡ confirmarPago desde frontend
exports.confirmarPago = onRequest({ secrets: [MP_TOKEN] }, (req, res) => {
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

      // Evita duplicar el pedido si ya fue procesado por webhook
      const existing = await db
        .collection("orders")
        .where("paymentId", "==", payment_id)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(200).json({ orderId: existing.docs[0].data().orderId });
      }

      const result = await guardarPedido(payment_id, orderData);
      return res.status(200).json(result);
    } catch (err) {
      console.error("Confirmar pago:", err);
      return res.status(500).json({ error: "Error verificando pago" });
    }
  });
});

// ⚡ webhookPago desde Mercado Pago
exports.webhookPago = onRequest({
  secrets: [MP_TOKEN],
  invoker: "public",            // ← muy importante para que Mercado Pago pueda acceder
  cors: true,
  region: "us-central1",
}, async (req, res) => {
  const token = MP_TOKEN.value();
  const mp = new MercadoPagoConfig({ accessToken: token });
  const paymentApi = new Payment(mp);

  const id = req.query["data.id"];
  const topic = req.query.topic || req.query.type;

  //console.log("📩 Webhook recibido:", req.query);
  console.log("🧠 Topic:", topic, "ID:", id);

  if (!id) {
    console.log("❌ Webhook sin data.id");
    return res.status(400).send("Falta data.id");
  }

  if (topic !== "payment") {
    console.log("ℹ️ Webhook recibido con topic diferente a 'payment':", topic);
    return res.status(200).send("OK");
  }

  try {
    const pago = await paymentApi.get({ id });

    if (pago.status !== "approved") {
      console.log("⚠️ Pago no aprobado:", pago.status);
      return res.status(200).send("No aprobado");
    }

    const externalRef = pago.external_reference;
    //console.log("🧾 Buscando pendingOrder con ID:", externalRef);
    const docRef = db.collection("pendingOrders").doc(externalRef);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("❌ No se encontró pendingOrder con external_reference:", externalRef);
      return res.status(404).send("Pedido pendiente no encontrado");
    }

    const { orderData } = docSnap.data();

    await guardarPedido(id, orderData);
    await docRef.delete();

    console.log("✅ Pedido confirmado por webhook:", externalRef);
    return res.status(200).send("Pedido confirmado");
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return res.status(500).send("Error en webhook");
  }
});

// ⚡ descontarStock — descuenta stock de cada item recibido
exports.descontarStock = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Formato inválido. Esperado: { items: [] }" });
    }

    const batch = db.batch();

    for (const item of items) {
      if (!item.id || typeof item.quantity !== "number") continue;

      const productRef = db.collection("menu").doc(item.id);
      const productSnap = await productRef.get();

      if (!productSnap.exists) continue;

      const currentStock = productSnap.data().stock || 0;
      const newStock = Math.max(currentStock - item.quantity, 0);

      batch.update(productRef, { stock: newStock });
    }

    await batch.commit();
    res.status(200).json({ success: true });
  });
});
