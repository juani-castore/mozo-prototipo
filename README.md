# Proyecto de MOZO para FUD en UTDT


# 🧾 MOZO - README PARA DESARROLLADORES

## 📦 Descripción General

**Mozo** es una app para que los clientes de un restaurante pidan comida y paguen online. El restaurante ve los pedidos en tiempo real y los imprime automáticamente en cocina.

---

## ⚙️ Flujo General

1. **Cliente elige productos** desde el menú (`Menu.jsx`) y los agrega al carrito (`CartContext.jsx`).
2. **Al finalizar el pedido**, llena un formulario (`Checkout.jsx`) y se genera un **link de pago de Mercado Pago** llamando a la Cloud Function `generarLinkDePago`.
3. El cliente es redirigido a Mercado Pago y realiza el pago.
4. Cuando el pago se aprueba, Mercado Pago llama al **webhook `webhookPago`**, que:
   - Confirma el pago con la API oficial.
   - Recupera los datos temporales (`pendingOrders`) y los guarda en la colección `orders`.
5. El restaurante ve el pedido nuevo en `Pedidos.jsx`, marcado como "NO IMPRESO".
6. El Raspberry Pi lo detecta y lo imprime con `printer.js`.

---

## 🧠 Estado Actual del Proyecto

✔️ **Lo que ya funciona y está bien estructurado:**
- Flujo de pagos y validación con webhook.
- Carga de pedidos nuevos en tiempo real.
- Impresión automática desde el Raspberry Pi.
- Lógica de recuperación si el Raspberry se reinicia.
- Componentes bien separados y claros para cliente y restaurante.

---

## 🚨 Puntos Importantes para Futuro Mantenimiento

### 1. `firebaseConfig.js` contiene claves
✅ No es un problema crítico. Firebase lo permite.  
🛠️ Recomendación futura: mover a variables de entorno si se usa un sistema con soporte (Vite, Next.js, etc).

### 2. `localStorage` guarda datos sensibles (`orderData`)
✅ Ya **no es crítico** porque el pedido se confirma por webhook.
🛠️ Puede dejarse para mostrar info post-pago, pero no es necesario.

### 3. `client_id` de Mercado Pago está expuesto
✅ No es riesgoso, pero sí es público.
🛠️ Ideal: mover el armado del `authUrl` al backend y pasarlo al frontend por props o endpoint.

### 4. URLs hardcodeadas (Cloud Functions)
✅ No rompe nada, pero **no es portable**.
🛠️ Reemplazar por variables de entorno (`import.meta.env.VITE_API_URL`) cuando se pase a producción final o se cambie el dominio.

### 5. Código duplicado para carrito (`App.jsx` vs `CartContext.jsx`)
✅ Funciona, pero genera duplicación/confusión.
🛠️ Sugerencia: **eliminar esto de `App.jsx`** y delegar completamente al `CartContext`, incluyendo persistencia con `localStorage`.

### 6. Archivo `testPrint.js`
✅ Era solo para probar la impresora.
🛠️ Eliminar en producción. Ya no es necesario.

---

## ✅ Mejoras recomendadas (sin urgencia)

| Mejora                                  | ¿Por qué?                                                     |
|----------------------------------------|----------------------------------------------------------------|
| Validación del stock antes de pagar    | Prevenir sobreventa si dos usuarios piden lo mismo            |
| Agregar logs con Sentry o Firestore    | Monitoreo de errores en pago / impresión / login              |
| Añadir roles de usuario en Firebase    | Para proteger rutas admin de forma real                        |
| Refactor en componentes del dashboard  | Separar vistas y lógica en `Pedidos.jsx`                      |
| Internacionalización (i18n)            | Si se quiere expandir a otros países                           |

---

## 📁 Estructura de Archivos (simplificada)

```
/src
 ├─ App.jsx
 ├─ main.jsx
 ├─ firebaseConfig.js
 ├─ CartContext.jsx
 ├─ components/
 │   ├─ Menu.jsx
 │   ├─ Cart.jsx
 │   ├─ Checkout.jsx
 │   ├─ OrderConfirmation.jsx
 │   ├─ Navbar.jsx
 │   ├─ Notification.jsx
 │   ├─ PaymentPending.jsx
 │   ├─ PaymentFailed.jsx
 │   ├─ RestauranteLogin.jsx
 │   ├─ RestauranteDashboard.jsx
 │   ├─ Pedidos.jsx
 │   └─ MenuDashboard.jsx
/server
 ├─ printer.js             # Impresión en Raspberry
 ├─ testPrint.js           # [puede eliminarse]
/functions
 ├─ index.js               # Cloud Functions (generarLinkDePago, confirmarPago, webhook)
 ├─ package.json
```

---

## 🧩 Variables de entorno sugeridas

```
VITE_FIREBASE_API_KEY=
VITE_API_URL=https://us-central1-...
VITE_MP_CLIENT_ID=
VITE_MP_REDIRECT_URI=
```

---

## 🧑‍💻 Tareas para el dev que ingrese

- Que limpie los puntos marcados arriba.
- Que documente las funciones Firebase si se expanden.
- Que optimice la modularidad y separación lógica (auth, pedidos, printer, etc).
- Que agregue tests básicos para la función de impresión y los pagos.
- Que prepare el build para producción (minificación, variables, rutas seguras).


-- Tambien hay que agregar lo de descontar el stock de los productos al momento de confirmar el pedido. [Todo esto desde el backend] | ya lo agregue como funtion separada pero hay que reanalizar el tema de que tan seguro es dejarlo asi.
