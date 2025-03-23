const functions = require("firebase-functions");
const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: functions.config().mercadopago.token,
});

exports.generarLinkDePago = functions.https.onCall(async (data, context) => {
  try {
    const { items, mesa } = data;

    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      back_urls: {
        success: "https://tu-app.web.app/success",
        failure: "https://tu-app.web.app/failure",
        pending: "https://tu-app.web.app/pending",
      },
      auto_return: "approved",
      metadata: { mesa }
    };

    const response = await mercadopago.preferences.create(preference);
    return { init_point: response.body.init_point };
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    throw new functions.https.HttpsError('internal', 'No se pudo generar el link de pago');
  }
});
