const { onCall, onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const corsHandler = cors({ origin: true });

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "us-central1" });

const clientSecret = process.env.MP_CLIENT_SECRET || admin.app().options?.clientSecret;
const baseUrl = process.env.BASE_URL || "https://mozo-prototipo.vercel.app"; // ajustalo si cambia

// 🔐 Obtener token dinámico de Firestore
async function getAccessToken() {
  const doc = await db.collection("integraciones").doc("mercadoPago").get();
  if (!doc.exists) throw new Error("MP no conectado");
  return doc.data().access_token;
}

// ✅ Generar link de pago
exports.generarLinkDePago = onCall(async (req) => {
  const { carrito, mesa, orderData } = req.data || {};
  if (!Array.isArray(carrito) || !orderData) {
    throw new Error("Datos inválidos.");
  }

  const access_token = await getAccessToken();
  mercadopago.configure({ access_token });

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

  try {
    const response = await mercadopago.preferences.create(preference);
    await db.collection("pendingOrders").doc(paymentId).set({
      orderData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { init_point: response.body.init_point, paymentId };
  } catch (err) {
    console.error("Error creando preferencia:", err);
    throw new Error("Error creando el link.");
  }
});

// ✅ Confirmación manual desde frontend
exports.confirmarPago = onCall(async (req) => {
  const { payment_id, orderData } = req.data || {};
  if (!payment_id || !orderData) {
    throw new Error("Datos incompletos.");
  }

  const access_token = await getAccessToken();
  mercadopago.configure({ access_token });

  try {
    const pago = await mercadopago.payment.findById(payment_id);
    if (pago.body.status !== "approved") {
      throw new Error(`Estado: ${pago.body.status}`);
    }

    return await guardarPedido(payment_id, orderData);
  } catch (err) {
    console.error("Confirmar pago:", err);
    throw new Error("Error verificando pago.");
  }
});

// ✅ Confirmación automática con CORS
exports.webhookPago = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const paymentId = req.body.data?.id;
    if (!paymentId) return res.status(400).send("Falta ID");

    try {
      const access_token = await getAccessToken();
      mercadopago.configure({ access_token });

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
      console.error("Webhook error:", err);
      return res.status(500).send("Error");
    }
  });
});

// ✅ Callback para el botón de conexión con MercadoPago
exports.callbackMP = onRequest(async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Falta code");

  try {
    const client_id = "5793584130197915";
    const redirect_uri = "https://callbackmp-o3y6kyilea-uc.a.run.app";

    const tokenResponse = await axios.post("https://api.mercadopago.com/oauth/token", {
      grant_type: "authorization_code",
      client_id,
      client_secret: clientSecret,
      code,
      redirect_uri,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const { access_token, public_key, user_id } = tokenResponse.data;
    await db.collection("integraciones").doc("mercadoPago").set({
      access_token,
      public_key,
      user_id,
      conectado: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.redirect("/restaurante/dashboard");
  } catch (err) {
    console.error("Callback MP:", err.response?.data || err.message);
    return res.status(500).send("Error conectando MP");
  }
});

// 🧾 Guardar pedido definitivo
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
