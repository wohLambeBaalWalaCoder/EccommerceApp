import { useState, useEffect } from 'react';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('shop'); // 'shop', 'login', 'register'
  const [currentUser, setCurrentUser] = useState(null);

  // Sync auth state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecommerce_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="app-root">
      {currentView === 'shop' && (
        <Shop
          currentUser={currentUser}
          onNavigateToAuth={() => setCurrentView(currentUser ? 'login' : 'login')}
        />
      )}

      {currentView === 'login' && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCurrentView('shop')}
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('shop');
            }}
            onLogout={() => setCurrentUser(null)}
            onGoToShop={() => setCurrentView('shop')}
          />
        </div>
      )}

      {currentView === 'register' && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCurrentView('shop')}
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('shop');
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
