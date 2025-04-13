// MenuDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Función auxiliar para obtener el día actual en minúsculas en español
const getCurrentDayKey = () => {
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const today = new Date().getDay();
  return days[today];
};

const MenuDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inflationRate, setInflationRate] = useState("");
  const [toggleState, setToggleState] = useState(false);
  const [formVisible, setFormVisible] = useState(false); // State to toggle form visibility

  // Estado para nuevo producto, incluyendo stockInicial (objeto)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    stockInicial: {}, // e.g. { lunes: 10, martes: 10, ... }
    recommended: false, // Nuevo campo
  });

  // Estado para edición
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);

  // Cargar productos desde Firestore
  const fetchMenuItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu items", err);
      setError("Error al cargar el menú");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Agrupar productos por categoría
  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      const cat = item.category || "Otros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  };

  // Reiniciar el stock diario de todos los productos, según el día actual y su stockInicial
  const handleResetDailyStock = async () => {
    const dayKey = getCurrentDayKey();
    if (
      !window.confirm(
        `¿Reiniciar el stock de todos los productos a su valor predeterminado para ${dayKey}?`
      )
    )
      return;
    try {
      for (let product of menuItems) {
        if (product.stockInicial && product.stockInicial[dayKey] !== undefined) {
          await updateDoc(doc(db, "menu", product.id), {
            stock: product.stockInicial[dayKey],
          });
        }
      }
      alert("Stock reiniciado para el día actual.");
      fetchMenuItems();
    } catch (err) {
      console.error("Error resetting daily stock", err);
    }
  };

  // Modo edición: iniciar edición de un producto
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditedProduct({ ...product });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditedProduct(null);
  };

  // Guardar edición con validaciones
  const handleSaveEdit = async () => {
    if (
      !editedProduct.name ||
      !editedProduct.category ||
      !editedProduct.price ||
      editedProduct.stock === ""
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    const price = parseFloat(editedProduct.price);
    const stock = parseInt(editedProduct.stock, 10);
    if (isNaN(price) || isNaN(stock) || price <= 0) {
      alert("Precio y stock deben ser números válidos, y el precio mayor que 0.");
      return;
    }
    // Validación: si el nuevo precio es menor al 50% del original, pedir confirmación.
    const originalProduct = menuItems.find(
      (item) => item.id === editingProductId
    );
    if (price < originalProduct.price * 0.5) {
      if (
        !window.confirm(
          "El nuevo precio es considerablemente menor al original. ¿Estás seguro?"
        )
      ) {
        return;
      }
    }
    try {
      await updateDoc(doc(db, "menu", editingProductId), {
        name: editedProduct.name,
        description: editedProduct.description,
        price: price,
        category: editedProduct.category,
        stock: stock,
        stockInicial: editedProduct.stockInicial,
        recommended: editedProduct.recommended,
      });
      handleCancelEdit();
      fetchMenuItems();
    } catch (err) {
      console.error("Error saving edited product", err);
    }
  };

  // Eliminar un producto
  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "menu", id));
        fetchMenuItems();
      } catch (err) {
        console.error("Error deleting product", err);
      }
    }
  };

  // Agregar nuevo producto (con validaciones)
  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      newProduct.stock === ""
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock, 10);
    if (isNaN(price) || isNaN(stock) || price <= 0) {
      alert("Precio y stock deben ser números válidos, y el precio mayor que 0.");
      return;
    }
    try {
      await addDoc(collection(db, "menu"), {
        name: newProduct.name,
        description: newProduct.description,
        price: price,
        category: newProduct.category,
        stock: stock,
        stockInicial: newProduct.stockInicial, // puede estar vacío o con valores
        recommended: newProduct.recommended, // Campo recomendado
      });
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        stockInicial: {},
        recommended: false,
      });
      fetchMenuItems();
    } catch (err) {
      console.error("Error adding product", err);
    }
  };

  // Botón de emergencia para poner el stock a 0 en modo visualización
  const handleEmergencyReset = async (id) => {
    if (window.confirm("¿Seguro deseas poner el stock a 0?")) {
      try {
        await updateDoc(doc(db, "menu", id), { stock: 0 });
        fetchMenuItems();
      } catch (err) {
        console.error("Error setting stock to 0", err);
      }
    }
  };

  // Botón de emergencia en modo edición: actualiza el stock en el estado editado a 0
  const handleEmergencyResetEdit = () => {
    setEditedProduct((prev) => ({ ...prev, stock: 0 }));
  };

  // Ajustar precios globalmente para inflación
  const handleAdjustForInflation = async () => {
    const rate = parseFloat(inflationRate);
    if (isNaN(rate) || rate < 0) {
      alert("Ingresa un porcentaje válido.");
      return;
    }
    try {
      for (let item of menuItems) {
        const newPrice = parseFloat(item.price) * (1 + rate / 100);
        await updateDoc(doc(db, "menu", item.id), { price: newPrice.toFixed(2) });
      }
      fetchMenuItems();
    } catch (err) {
      console.error("Error updating prices", err);
    }
  };

  // Función para alternar el estado "recommended" desde la vista (modo visualización)
  const handleToggleRecommended = async (product) => {
    try {
      const newRecommendedStatus = !product.recommended;
      await updateDoc(doc(db, "menu", product.id), {
        recommended: newRecommendedStatus,
      });
      setToggleState(!toggleState); // Trigger a re-render
      fetchMenuItems(); // Refresh the menu items
    } catch (err) {
      console.error("Error updating recommended status", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Dashboard de Menú</h2>

      {/* Button to toggle form visibility */}
      <button
        onClick={() => setFormVisible(!formVisible)}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow mb-4"
      >
        {formVisible ? "Ocultar Formulario" : "Agregar Nuevo Producto"}
      </button>

      {/* Collapsible form */}
      {formVisible && (
        <div className="mb-6 border p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Agregar Nuevo Producto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="border p-2"
            />
            <div className="col-span-1">
              <input
                type="text"
                placeholder="Categoría"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="border p-2"
                list="categorySuggestions"
              />
              <datalist id="categorySuggestions">
                {Object.keys(groupByCategory(menuItems)).map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <input
              type="number"
              placeholder="Precio"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="border p-2"
            />
            <input
              type="number"
              placeholder="Stock Inicial"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
              className="border p-2"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="border p-2 md:col-span-3"
            />
          </div>
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Stock Inicial Diario (opcional)</h4>
            {["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map((day) => (
              <div key={day} className="flex items-center mb-2">
                <label className="mr-2 capitalize">{day}:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={
                    (newProduct.stockInicial && newProduct.stockInicial[day]) || ""
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    setNewProduct((prev) => ({
                      ...prev,
                      stockInicial: { ...prev.stockInicial, [day]: value },
                    }));
                  }}
                  className="border p-1"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleAddProduct}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
          >
            Agregar Producto
          </button>
        </div>
      )}

      {/* Botón global para reiniciar stock diario */}
      <div className="mb-6">
        <button
          onClick={handleResetDailyStock}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow"
        >
          Reiniciar Stock Diario (según día actual)
        </button>
      </div>

      {loading && <p>Cargando menú...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Sección para ajuste por Inflación */}
      <div className="mb-6 border p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Ajuste por Inflación</h3>
        <input
          type="number"
          placeholder="Porcentaje de aumento"
          value={inflationRate}
          onChange={(e) => setInflationRate(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleAdjustForInflation}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ajustar Precios
        </button>
      </div>

      {/* Product list */}
      {Object.keys(groupByCategory(menuItems)).map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupByCategory(menuItems)[category].map((product) => (
              <div key={product.id} className="border p-4 rounded shadow">
                {editingProductId === product.id ? (
                  // Modo edición
                  <div>
                    <input
                      type="text"
                      value={editedProduct.name}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          name: e.target.value,
                        })
                      }
                      className="border p-1 mb-2 w-full"
                    />
                    <input
                      type="text"
                      placeholder="Categoría"
                      value={editedProduct.category}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          category: e.target.value,
                        })
                      }
                      className="border p-1 mb-2 w-full"
                    />
                    <textarea
                      placeholder="Descripción"
                      value={editedProduct.description}
                      onChange={(e) =>
                        setEditedProduct({
                          ...editedProduct,
                          description: e.target.value,
                        })
                      }
                      className="border p-1 mb-2 w-full"
                    />
                    <div className="mb-2">
                      <label className="mr-2">Precio:</label>
                      <input
                        type="number"
                        value={editedProduct.price}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            price: e.target.value,
                          })
                        }
                        className="border p-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="mr-2">Stock:</label>
                      <input
                        type="number"
                        value={editedProduct.stock}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct,
                            stock: e.target.value,
                          })
                        }
                        className="border p-1"
                      />
                      <button
                        onClick={handleEmergencyResetEdit}
                        className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      >
                        Emergencia: 0
                      </button>
                    </div>
                    {/* Sección para editar stock inicial diario */}
                    <div className="mb-2 border-t pt-2">
                      <h4 className="font-semibold mb-2">Stock Inicial Diario</h4>
                      {["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map((day) => (
                        <div key={day} className="flex items-center mb-2">
                          <label className="mr-2 capitalize">{day}:</label>
                          <input
                            type="number"
                            value={
                              (editedProduct.stockInicial && editedProduct.stockInicial[day]) ||
                              ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditedProduct((prev) => ({
                                ...prev,
                                stockInicial: { ...prev.stockInicial, [day]: value },
                              }));
                            }}
                            className="border p-1"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Interruptor estético para "Recomendado" en modo edición */}
                    <div className="mb-2 flex items-center">
                      <span className="mr-2">¿Recomendado?</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedProduct.recommended}
                          onChange={(e) =>
                            setEditedProduct({ ...editedProduct, recommended: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500
                          after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                          after:bg-white after:border-gray-300 after:border after:rounded-full
                          after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-full">
                        </div>
                      </label>
                    </div>
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  // Modo visualización
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-semibold">{product.name}</h4>
                      <div>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-500 mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="mt-2">
                      Precio: ${parseFloat(product.price).toFixed(2)}
                    </p>
                    <p className="mt-2">Stock: {product.stock}</p>
                    <div className="flex items-center mt-2">
                      <span className="mr-2">Recomendado</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.recommended || false} // Default to false if undefined
                          onChange={() => handleToggleRecommended(product)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-11 h-6 rounded-full peer ${
                            product.recommended ? "bg-green-500" : "bg-gray-200"
                          } after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                          after:bg-white after:border-gray-300 after:border after:rounded-full
                          after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-full`}
                        ></div>
                      </label>
                    </div>
                    {product.stockInicial && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            const target = e.target.nextSibling;
                            target.style.display =
                              target.style.display === "none" ? "block" : "none";
                          }}
                          className="text-blue-500 underline"
                        >
                          Ver Stock Inicial
                        </button>
                        <div style={{ display: "none" }} className="mt-2">
                          {Object.entries(product.stockInicial).map(
                            ([day, value]) => (
                              <p key={day} className="text-sm text-gray-600">
                                {day.charAt(0).toUpperCase() + day.slice(1)}: {value}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {product.description && (
                      <p className="mt-2">Descripción: {product.description}</p>
                    )}
                    <button
                      onClick={() => handleEmergencyReset(product.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                      Emergencia: 0
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuDashboard;
