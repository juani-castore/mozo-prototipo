// functions/index.js
// require('dotenv').config();

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

const mpToken = process.env.MP_TOKEN;
const baseUrl = process.env.BASE_URL;

exports.generarLinkDePago = onCall({ region: "us-central1" }, async (data) => {
  const { carrito, mesa } = data.data;

  if (!mpToken) {
    console.error("MP_TOKEN no configurado en variables de entorno");
    throw new HttpsError("failed-precondition", "Token de MercadoPago no configurado.");
  }
  mercadopago.configure({ access_token: mpToken });

  if (!Array.isArray(carrito)) {
    throw new HttpsError("invalid-argument", "Carrito inválido.");
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

  try {
    const response = await mercadopago.preferences.create(preference);
    return { init_point: response.body.init_point };
  } catch (err) {
    console.error("Error creando preferencia:", err);
    throw new HttpsError("internal", "No se pudo crear el link de pago.");
  }
});

exports.confirmarPago = onCall({ region: "us-central1" }, async (data) => {
  const { payment_id, orderData } = data;

  if (!mpToken) {
    console.error("MP_TOKEN no configurado en variables de entorno");
    throw new HttpsError("failed-precondition", "Token de MercadoPago no configurado.");
  }
  mercadopago.configure({ access_token: mpToken });

  if (!payment_id || !orderData) {
    throw new HttpsError("invalid-argument", "Se requieren payment_id y orderData.");
  }

  let mpResponse;
  try {
    mpResponse = await mercadopago.payment.findById(payment_id);
  } catch (err) {
    console.error("Error consultando MercadoPago:", err);
    throw new HttpsError("internal", "Error en MercadoPago.");
  }
  if (mpResponse.body.status !== "approved") {
    throw new HttpsError("failed-precondition", `Pago no aprobado: ${mpResponse.body.status}`);
  }

  const counterRef = db.collection("counters").doc("orders");
  const counterSnap = await counterRef.get();
  let newOrderId = 1;
  if (counterSnap.exists) {
    newOrderId = counterSnap.data().lastId + 1;
    await counterRef.update({ lastId: newOrderId });
  } else {
    await counterRef.set({ lastId: newOrderId });
  }

  const { name, email, pickupTime, comments, cart } = orderData;
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  await db.collection("orders").add({
    orderId: newOrderId,
    name,
    email,
    pickupTime,
    comments,
    total,
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    timeSubmitted: admin.firestore.FieldValue.serverTimestamp(),
    status: "approved",
    paymentId: payment_id,
  });

  return { orderId: newOrderId };
});
