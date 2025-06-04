const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();

const mpToken = process.env.MP_TOKEN || functions.config().mercadopago.token;
const baseUrl = process.env.BASE_URL || functions.config().app.base_url;
const clientSecret = functions.config().mercadopago.client_secret;

// ✅ Genera link de pago y guarda pedido temporal
exports.generarLinkDePago = functions.https.onCall(async (req, context) => {
  const { carrito, mesa, orderData } = req.data || {};

  if (!mpToken) throw new functions.https.HttpsError("failed-precondition", "MP_TOKEN no configurado.");
  if (!Array.isArray(carrito) || !orderData) {
    throw new functions.https.HttpsError("invalid-argument", "Carrito u orderData inválido.");
  }

  mercadopago.configure({ access_token: mpToken });

  const paymentId = uuidv4();
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
    external_reference: paymentId,
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    await db.collection("pendingOrders").doc(paymentId).set({
      orderData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { init_point: response.body.init_point, paymentId };
  } catch (err) {
    console.error("Error creando preferencia:", err);
    throw new functions.https.HttpsError("internal", "No se pudo crear el link de pago.");
  }
});

// ✅ Confirma pago desde frontend
exports.confirmarPago = functions.https.onCall(async (req, context) => {
  const { payment_id, orderData } = req.data || {};

  if (!mpToken) throw new functions.https.HttpsError("failed-precondition", "MP_TOKEN no configurado.");
  if (!payment_id || !orderData) {
    throw new functions.https.HttpsError("invalid-argument", "Faltan payment_id u orderData.");
  }

  mercadopago.configure({ access_token: mpToken });

  try {
    const mpResponse = await mercadopago.payment.findById(payment_id);
    if (mpResponse.body.status !== "approved") {
      throw new functions.https.HttpsError("failed-precondition", `Pago no aprobado: ${mpResponse.body.status}`);
    }

    return await guardarPedido(payment_id, orderData);
  } catch (err) {
    console.error("Error consultando MP:", err);
    throw new functions.https.HttpsError("internal", "Error en MercadoPago.");
  }
});

// ✅ Confirma pago automáticamente si el usuario no vuelve
exports.webhookPago = functions.https.onRequest(async (req, res) => {
  const paymentId = req.body.data?.id;
  if (!paymentId) return res.status(400).send("Falta payment_id");

  try {
    mercadopago.configure({ access_token: mpToken });
    const mpResponse = await mercadopago.payment.findById(paymentId);
    const status = mpResponse.body.status;
    const reference = mpResponse.body.external_reference;

    if (status !== "approved") return res.status(200).send("Pago no aprobado");

    const ref = db.collection("pendingOrders").doc(reference);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).send("OrderData no encontrado");

    const orderData = doc.data().orderData;
    await guardarPedido(paymentId, orderData);
    await ref.delete();

    return res.status(200).send("Pedido confirmado vía webhook");
  } catch (err) {
    console.error("Error en webhook:", err);
    return res.status(500).send("Error interno");
  }
});

// ✅ Recibe el `code` de MP y guarda el access_token
exports.callbackMP = functions.https.onRequest(async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Falta el parámetro 'code'");

  try {
    const client_id = "5793584130197915";
    const redirect_uri = "https://us-central1-prototipo-mozo.cloudfunctions.net/callbackMP";

    const response = await axios.post("https://api.mercadopago.com/oauth/token", {
      grant_type: "authorization_code",
      client_id,
      client_secret: clientSecret,
      code,
      redirect_uri,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const { access_token, public_key, user_id } = response.data;

    await db.collection("integraciones").doc("mercadoPago").set({
      access_token,
      public_key,
      user_id,
      conectado: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.redirect("/restaurante/dashboard");
  } catch (err) {
    console.error("Error en callbackMP:", err.response?.data || err.message);
    return res.status(500).send("Error al obtener access_token de Mercado Pago.");
  }
});

// ✅ Función reutilizable para guardar un pedido
async function guardarPedido(paymentId, orderData) {
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
  const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

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
    printed: false,
    paymentId,
  });

  return { orderId: newOrderId };
}
