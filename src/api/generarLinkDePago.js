import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Método no permitido
  }

  const { items, mesa } = req.body;

  try {
    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      back_urls: {
        success: "https://mozo.vercel.app/success",
        failure: "https://mozo.vercel.app/failure",
        pending: "https://mozo.vercel.app/pending",
      },
      auto_return: "approved",
      metadata: { mesa }
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear la preferencia' });
  }
}
