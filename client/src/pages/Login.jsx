import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import './Login.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Login({ onSwitchToRegister, onAuthSuccess, onLogout, onGoToShop }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState('');

  // Check on mount if user is already authenticated
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ecommerce_user');
      const storedToken = localStorage.getItem('ecommerce_token');
      if (storedUser && storedToken) {
        setCurrentUser(JSON.parse(storedUser));
        setUserToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    }
  }, []);

  const handleDemoFill = (type) => {
    setError('');
    setSuccessMsg('');
    if (type === 'customer') {
      setEmail('customer@nexus.com');
      setPassword('Customer123!');
    } else if (type === 'admin') {
      setEmail('admin@nexus.com');
      setPassword('AdminSecret123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        setCurrentUser(user);
        setUserToken(token);
        setSuccessMsg(`Welcome back, ${user.name}! You are successfully logged in.`);

        if (rememberMe) {
          localStorage.setItem('ecommerce_user', JSON.stringify(user));
          localStorage.setItem('ecommerce_token', token);
        } else {
          sessionStorage.setItem('ecommerce_user', JSON.stringify(user));
          sessionStorage.setItem('ecommerce_token', token);
        }

        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(user);
          }, 800);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please verify backend is running on port 5000.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('ecommerce_token');
    sessionStorage.removeItem('ecommerce_user');
    sessionStorage.removeItem('ecommerce_token');
    setCurrentUser(null);
    setUserToken('');
    setEmail('');
    setPassword('');
    setSuccessMsg('');
    setError('');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="login-container">
      {/* Dynamic ambient glowing backgrounds */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="brand-badge">
            <ShoppingBag className="brand-icon" />
            <span className="brand-title">NEXUS COMMERCE</span>
          </div>

          <h1 className="login-title">
            {currentUser ? 'Account Dashboard' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle">
            {currentUser
              ? 'You are currently authenticated in the system'
              : 'Sign in to access your orders, cart, and exclusive rewards'}
          </p>
        </div>

        {/* If already logged in, show authenticated state card */}
        {currentUser ? (
          <div className="logged-in-profile">
            <div className="profile-avatar">
              <span className="profile-avatar-initials">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>

            <h2 className="profile-name">{currentUser.name}</h2>
            <p className="profile-email">{currentUser.email}</p>

            <span className={`role-badge ${currentUser.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
              {currentUser.role === 'admin' ? '👑 Admin Access' : '✨ Verified Customer'}
            </span>

            <div className="token-preview">
              <div className="token-label">
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Active JWT Bearer Token:
              </div>
              <div className="token-value">
                {userToken ? `${userToken.slice(0, 32)}...${userToken.slice(-16)}` : 'Active'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              {onGoToShop && (
                <button
                  type="button"
                  onClick={onGoToShop}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <ShoppingBag size={16} />
                  Shop Now
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout} style={{ flex: 1 }}>
                <LogOut size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <>
            {/* Quick Demo Fill Helper */}
            <div className="demo-accounts">
              <div className="demo-title">
                <Sparkles size={15} color="#818cf8" />
                Quick Test Credentials
              </div>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleDemoFill('customer')}
                >
                  ⚡ Customer
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleDemoFill('admin')}
                >
                  👑 Admin
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="alert-banner alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="alert-banner alert-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email-input"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer Sign Up Link */}
            <div className="login-footer">
              Don't have an account?
              <button
                type="button"
                className="signup-link"
                onClick={onSwitchToRegister}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
              >
                Create an account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
