const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Leer variables de entorno de Firebase Functions config
const getConfig = () => {
  const cfg = functions.config();
  return {
    mpToken: cfg.mercadopago?.token,
    baseUrl: cfg.app?.base_url,
  };
};

// Función para generar link de pago
exports.generarLinkDePago = functions.https.onCall(async (data, context) => {
  const { carrito, mesa } = data;
  const { mpToken, baseUrl } = getConfig();

  if (!mpToken) {
    console.error("MP_TOKEN no configurado en Firebase Functions config");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Token de MercadoPago no configurado."
    );
  }

  mercadopago.configure({ access_token: mpToken });

  if (!Array.isArray(carrito)) {
    throw new functions.https.HttpsError("invalid-argument", "Carrito inválido.");
  }

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
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    return { init_point: response.body.init_point };
  } catch (err) {
    console.error("Error creando preferencia:", err);
    throw new functions.https.HttpsError("internal", "No se pudo crear el link de pago.");
  }
});

// Función para confirmar pago y guardar pedido
exports.confirmarPago = functions.https.onCall(async (data, context) => {
  const { payment_id, orderData } = data;
  const { mpToken } = getConfig();

  if (!mpToken) {
    console.error("MP_TOKEN no configurado en Firebase Functions config");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Token de MercadoPago no configurado."
    );
  }

  mercadopago.configure({ access_token: mpToken });

  if (!payment_id || !orderData) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requieren payment_id y orderData."
    );
  }

  // 1) Verificar estado del pago en MercadoPago
  let mpResponse;
  try {
    mpResponse = await mercadopago.payment.findById(payment_id);
  } catch (err) {
    console.error("Error consultando MercadoPago:", err);
    throw new functions.https.HttpsError("internal", "Error en MercadoPago.");
  }

  if (mpResponse.body.status !== "approved") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Pago no aprobado: ${mpResponse.body.status}`
    );
  }

  // 2) Generar orderId de manera atómica
  const counterRef = db.collection("counters").doc("orders");
  const counterSnap = await counterRef.get();
  let newOrderId = 1;
  if (counterSnap.exists) {
    newOrderId = counterSnap.data().lastId + 1;
    await counterRef.update({ lastId: newOrderId });
  } else {
    await counterRef.set({ lastId: newOrderId });
  }

  // 3) Guardar el pedido en Firestore
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
    items: cart.map(item => ({
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
