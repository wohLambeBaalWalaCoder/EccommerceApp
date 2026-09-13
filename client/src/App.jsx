import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  return (
    <main>
      {currentView === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </main>
  );
}

export default App;
