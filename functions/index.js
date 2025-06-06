const { onRequest, onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });
const baseUrl = "https://mozo-prototipo.vercel.app";
const MP_TOKEN = defineSecret("MP_TOKEN");

// ⚡ Función HTTP: generar link de pago
exports.generarLinkDePago = onRequest({ secrets: [MP_TOKEN] }, async (req, res) => {
  console.log("Request received:", req.body);
  const token = MP_TOKEN.value();
  mercadopago.configurations.setAccessToken(token);

  const { carrito, mesa, orderData } = req.body || {};
  if (!Array.isArray(carrito) || !orderData) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const paymentId = uuidv4();
    const preference = {
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

    const response = await mercadopago.preferences.create(preference);

    await db.collection("pendingOrders").doc(paymentId).set({
      orderData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ init_point: response.body.init_point, paymentId });
  } catch (err) {
    console.error("Error creando preferencia:", err);
    res.status(500).json({ error: err.message || "Error interno" });
  }
});

// ⚡ Función callable: confirmar pago
exports.confirmarPago = onCall({ secrets: [MP_TOKEN] }, async (data) => {
  const token = MP_TOKEN.value();
  mercadopago.configurations.setAccessToken(token);

  const { payment_id, orderData } = data || {};
  if (!payment_id || !orderData) {
    throw new Error("Datos incompletos");
  }

  try {
    const pago = await mercadopago.payment.findById(payment_id);
    if (pago.body.status !== "approved") {
      throw new Error(`Estado del pago: ${pago.body.status}`);
    }

    return await guardarPedido(payment_id, orderData);
  } catch (err) {
    console.error("Confirmar pago:", err);
    throw new Error("Error verificando pago");
  }
});

// ⚡ Webhook MP (no requiere secrets)
exports.webhookPago = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const paymentId = req.body.data?.id;
    if (!paymentId) return res.status(400).send("Falta ID");

    try {
      const token = MP_TOKEN.value();
      mercadopago.configurations.setAccessToken(token);

      const pago = await mercadopago.payment.findById(paymentId);
      if (pago.body.status !== "approved") return res.status(200).send("No aprobado");

      const ref = pago.body.external_reference;
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

// 📦 Guardar pedido confirmado
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
