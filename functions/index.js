// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

const mpToken = process.env.MP_TOKEN;
const baseUrl = process.env.BASE_URL;

/**
 * Genera el link de pago y permite llamadas públicas.
 */
exports.generarLinkDePago = onCall(
  {
    region: "us-central1",
    invoker: ["public"], // permite invocación anónima desde el navegador
  },
  async (req) => {
    // <-- acá lees req.data, no req ni req.body
    const { carrito, mesa } = req.data || {};

    console.log("generarLinkDePago ─ req.data:", req.data);

    if (!mpToken) {
      console.error("MP_TOKEN no configurado");
      throw new HttpsError(
        "failed-precondition",
        "Token de MercadoPago no configurado."
      );
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
  }
);

/**
 * Confirma el pago y guarda la orden; también pública.
 */
exports.confirmarPago = onCall(
  {
    region: "us-central1",
    invoker: ["public"], // permite invocación anónima desde el navegador
  },
  async (req) => {
    // de nuevo: req.data y nada de JSON.stringify(req)
    const { payment_id, orderData } = req.data || {};

    console.log("confirmarPago ─ req.data:", req.data);

    if (!mpToken) {
      console.error("MP_TOKEN no configurado");
      throw new HttpsError(
        "failed-precondition",
        "Token de MercadoPago no configurado."
      );
    }
    mercadopago.configure({ access_token: mpToken });

    if (!payment_id || !orderData) {
      throw new HttpsError(
        "invalid-argument",
        "Se requieren payment_id y orderData."
      );
    }

    let mpResponse;
    try {
      mpResponse = await mercadopago.payment.findById(payment_id);
    } catch (err) {
      console.error("Error consultando MercadoPago:", err);
      throw new HttpsError("internal", "Error en MercadoPago.");
    }
    if (mpResponse.body.status !== "approved") {
      throw new HttpsError(
        "failed-precondition",
        `Pago no aprobado: ${mpResponse.body.status}`
      );
    }

    // Actualiza contador
    const counterRef = db.collection("counters").doc("orders");
    const counterSnap = await counterRef.get();
    let newOrderId = 1;
    if (counterSnap.exists) {
      newOrderId = counterSnap.data().lastId + 1;
      await counterRef.update({ lastId: newOrderId });
    } else {
      await counterRef.set({ lastId: newOrderId });
    }

    // Desestructura los datos del pedido
    const { name, email, pickupTime, comments, cart } = orderData;
    const total = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Guarda en Firestore
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
  }
);
