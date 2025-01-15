import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: '#333', textAlign: 'center' }}>¡Hola! Mozo está funcionando</h1>
      </div>
    </div>
  );
}

export default App;
