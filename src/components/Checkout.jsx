import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Juani Castore',
    email: 'correo@gmail.com',
    address: 'Av. Alcorta 123',
    cardNumber: '1111 1111 1111 1111',
    expiration: '12/26',
    cvv: '123',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirige a la pantalla de confirmación
    navigate('/order-confirmation');
  };

  return (
    <div className="container">
      <h2>Formulario de Pago</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nombre completo:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Correo electrónico:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Dirección:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Número de tarjeta:</label>
          <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <div>
            <label>Expiración:</label>
            <input type="text" name="expiration" value={formData.expiration} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>CVV:</label>
            <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
          </div>
        </div>
        <button type="submit" style={{ width: '100%' }}>Confirmar Pago</button>
      </form>
    </div>
  );
};

export default Checkout;
