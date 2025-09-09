// src/components/OrderConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const formatArs = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(n)
    : n;

const OrderConfirmation = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para enriquecer la UI sin tocar backend
  const [orderSummary, setOrderSummary] = useState(null);
  const [mpInfo, setMpInfo] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const processOrder = async () => {
      const paymentId = params.get("payment_id");
      const status = params.get("status"); // suele venir de MP
      const preferenceId = params.get("preference_id");

      setMpInfo({
        paymentId: paymentId || null,
        status: status || null,
        preferenceId: preferenceId || null,
      });

      if (!paymentId) {
        alert("Pago no válido.");
        setLoading(false);
        return;
      }

      // ✅ Fallback seguro si el usuario refresca la página
      const lastOrderRaw = localStorage.getItem("lastOrder");
      if (!localStorage.getItem("orderData") && lastOrderRaw) {
        try {
          const lastOrder = JSON.parse(lastOrderRaw);
          if (lastOrder?.mp?.paymentId === paymentId) {
            setOrderId(lastOrder.orderId);
            setOrderSummary(lastOrder.orderData);
            setMpInfo((prev) => ({
              ...prev,
              paymentId: lastOrder.mp.paymentId || prev.paymentId,
              status: lastOrder.mp.status || prev.status,
              preferenceId: lastOrder.mp.preferenceId || prev.preferenceId,
            }));
            setLoading(false);
            return; // 🔒 no re-confirmamos el pago
          }
        } catch {
          // si hay algo raro, seguimos con el flujo normal
        }
      }

      const orderDataRaw = localStorage.getItem("orderData");
      if (!orderDataRaw) {
        alert("No se encontraron datos del pedido.");
        setLoading(false);
        return;
      }

      // Guardar en estado ANTES de limpiar el storage
      const orderData = JSON.parse(orderDataRaw);
      setOrderSummary(orderData);

      try {
        // Confirmar pago (sin cambios)
        const response = await fetch(
          "https://us-central1-prototipo-mozo.cloudfunctions.net/confirmarPago",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id: paymentId, orderData }),
          }
        );

        if (!response.ok) throw new Error("Error al confirmar el pago");

        const data = await response.json();
        setOrderId(data.orderId);

        // Descontar stock (best-effort, sin cambios)
        try {
          await fetch(
            "https://us-central1-prototipo-mozo.cloudfunctions.net/descontarStock",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: orderData.cart }),
            }
          );
        } catch (err) {
          console.warn("⚠️ No se pudo descontar stock:", err);
        }

        // Guardar copia para soportar refresh (opcional)
        try {
          localStorage.setItem(
            "lastOrder",
            JSON.stringify({
              orderId: data.orderId,
              orderData,
              mp: { paymentId, status, preferenceId },
              savedAt: new Date().toISOString(),
            })
          );
        } catch {
          // si falla storage, no afecta al flujo principal
        }

        // Limpiar carrito/orden activa (como ya hacías)
        localStorage.removeItem("orderData");
        localStorage.removeItem("cart");
      } catch (error) {
        console.error("Error confirmando el pago:", error);
        alert("Hubo un problema al confirmar tu pago.");
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [params]);

  if (loading) {
    return <p className="text-center mt-10">Procesando pedido...</p>;
  }

  // Texto explicativo con hora de retiro si existe
  const retiroFrase =
    orderSummary?.pickupTime && orderSummary.pickupTime !== ""
      ? `Ya podés pasar por la barra del FUD a las ${orderSummary.pickupTime} para retirar tu pedido. `
      : "Ya podés pasar por la barra del FUD para retirar tu pedido cuando esté listo. ";

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(String(orderId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // 👉 Descargar PDF con jsPDF instalado localmente + fallback TXT si algo falla
  const downloadPdf = async () => {
    const filenameBase = `pedido-fud-${orderId || "sin-numero"}`;

    const lines = [];
    lines.push(`Pedido FUD #${orderId ?? ""}`);
    lines.push(`----------------------------`);
    if (orderSummary?.customerName) lines.push(`Cliente: ${orderSummary.customerName}`);
    if (orderSummary?.email) lines.push(`Email: ${orderSummary.email}`);
    if (orderSummary?.pickupTime) lines.push(`Retiro: ${orderSummary.pickupTime}`);
    if (orderSummary?.comments) lines.push(`Notas: ${orderSummary.comments}`);
    lines.push("");
    lines.push("Items:");
    if (Array.isArray(orderSummary?.cart)) {
      orderSummary.cart.forEach((it) => {
        const price =
          typeof it.price === "number" ? formatArs(it.price * (it.quantity || 1)) : "";
        lines.push(`• ${it.quantity || 1}× ${it.name}${price ? ` - ${price}` : ""}`);
      });
    }
    if (typeof orderSummary?.total === "number") {
      lines.push("");
      lines.push(`Total: ${formatArs(orderSummary.total)}`);
    }
    lines.push("");
    if (mpInfo?.paymentId) lines.push(`Payment ID: ${mpInfo.paymentId}`);
    if (mpInfo?.status) lines.push(`Estado: ${mpInfo.status}`);
    lines.push(`Generado: ${new Date().toLocaleString()}`);

    try {
      // paquete local (no carga hasta hacer click)
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const marginX = 14;
      const lineHeight = 8;
      let y = 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Pedido FUD #${orderId ?? ""}`, marginX, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      lines.slice(1).forEach((l) => {
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
        y += lineHeight;
        doc.text(l, marginX, y);
      });

      doc.save(`${filenameBase}.pdf`);
    } catch (e) {
      // Fallback TXT: nunca rompe el flujo
      const blob = new Blob([lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filenameBase}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold text-green-700 mb-2">¡Gracias por tu compra!</h1>
      <p className="text-lg">Tu número de pedido es:</p>
      <h2 className="text-4xl font-bold text-brick my-3">{orderId}</h2>

      <div className="flex items-center justify-center gap-2 mb-2">
        <button
          onClick={copyOrderId}
          className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
          aria-label="Copiar número de pedido"
        >
          Copiar número
        </button>
        {copied && <span className="text-xs text-green-700">¡Copiado!</span>}
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Guardá este número o sacale una captura.
      </p>

      {/* Explicación simple para el cliente */}
      <p className="text-sm text-gray-700 mb-6 px-2 leading-relaxed">
        {retiroFrase}
        Acercate por la barra de cosas dulces y pedile tu pedido a algún empleado
        mostrando o diciendo tu número de pedido y tu nombre.
      </p>

      {/* Resumen del pedido (desde localStorage o lastOrder) */}
      {orderSummary && (
        <div className="text-left bg-white/70 rounded-lg p-4 shadow-sm border print-card">
          <h3 className="font-semibold text-gray-800 mb-2">Resumen</h3>

          {orderSummary?.customerName && (
            <p className="text-sm">
              <span className="font-medium">Cliente:</span> {orderSummary.customerName}
            </p>
          )}
          {orderSummary?.email && (
            <p className="text-sm">
              <span className="font-medium">Email:</span> {orderSummary.email}
            </p>
          )}
          {orderSummary?.pickupTime && orderSummary.pickupTime !== "" && (
            <p className="text-sm">
              <span className="font-medium">Retiro:</span> {orderSummary.pickupTime}
            </p>
          )}
          {orderSummary?.comments && orderSummary.comments !== "" && (
            <p className="text-sm">
              <span className="font-medium">Notas:</span> {orderSummary.comments}
            </p>
          )}

          {/* Items */}
          {Array.isArray(orderSummary?.cart) && orderSummary.cart.length > 0 && (
            <div className="mt-3">
              <ul className="divide-y">
                {orderSummary.cart.map((it, idx) => (
                  <li key={idx} className="py-2 flex justify-between text-sm">
                    <span className="mr-2">
                      {it.quantity}× {it.name}
                    </span>
                    {typeof it.price === "number" && (
                      <span>{formatArs(it.price * it.quantity)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Total */}
          {typeof orderSummary?.total === "number" && (
            <div className="mt-3 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatArs(orderSummary.total)}</span>
            </div>
          )}
        </div>
      )}

      {/* Info de pago (desde la URL o fallback) */}
      {(mpInfo?.paymentId || mpInfo?.status) && (
        <div className="text-left bg-white/70 rounded-lg p-4 shadow-sm border mt-4 print-card">
          <h3 className="font-semibold text-gray-800 mb-2">Pago</h3>
          {mpInfo.paymentId && (
            <p className="text-sm">
              <span className="font-medium">Payment ID:</span> {mpInfo.paymentId}
            </p>
          )}
          {mpInfo.status && (
            <p className="text-sm">
              <span className="font-medium">Estado:</span> {mpInfo.status}
            </p>
          )}
        </div>
      )}

      {/* Acciones: Descargar PDF + WhatsApp */}
      {orderId && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="px-4 py-2 rounded-md bg-brick text-white hover:opacity-90"
            onClick={downloadPdf}
          >
            Descargar PDF
          </button>

          {orderSummary?.cart && (
            <a
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
              href={`https://wa.me/?text=${encodeURIComponent(
                `Mi pedido #${orderId}\n` +
                  (orderSummary.customerName ? `Cliente: ${orderSummary.customerName}\n` : "") +
                  (orderSummary.pickupTime ? `Retiro: ${orderSummary.pickupTime}\n` : "") +
                  orderSummary.cart
                    .map(
                      (it) =>
                        `• ${it.quantity}× ${it.name}${
                          it.price ? ` (${formatArs(it.price)})` : ""
                        }`
                    )
                    .join("\n") +
                  (typeof orderSummary.total === "number"
                    ? `\nTotal: ${formatArs(orderSummary.total)}`
                    : "")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Compartir por WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
