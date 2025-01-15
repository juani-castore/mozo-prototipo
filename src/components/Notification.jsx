import React, { useEffect } from 'react';

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); // Cierra automáticamente después de 2 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '10%',
        right: '10%',
        backgroundColor: '#CCA43B',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};

export default Notification;
