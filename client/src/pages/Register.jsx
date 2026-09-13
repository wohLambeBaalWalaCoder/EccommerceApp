import { useState } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  Truck,
  ShieldCheck,
  Check
} from 'lucide-react';
import './Login.css';
import './Register.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Register({ onSwitchToLogin, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strengthScore = calculatePasswordStrength(password);
  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { text: 'Weak', class: 'weak' };
    if (strengthScore === 2 || strengthScore === 3) return { text: 'Medium', class: 'medium' };
    return { text: 'Strong', class: 'strong' };
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to create an account.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'customer'
      });

      if (response.data.success) {
        const { user, token } = response.data;
        setSuccessMsg(`Welcome to Nexus Commerce, ${user.name}! Your account has been created.`);

        // Store auth tokens
        localStorage.setItem('ecommerce_user', JSON.stringify(user));
        localStorage.setItem('ecommerce_token', token);

        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(user, token);
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please verify backend is running on port 5000.');
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Dynamic ambient glowing background */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      <div className="register-card">
        {/* Brand Header */}
        <div className="register-header">
          <div className="brand-badge">
            <ShoppingBag className="brand-icon" />
            <span className="brand-title">NEXUS COMMERCE</span>
          </div>

          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Join thousands of shoppers enjoying exclusive discounts and free shipping
          </p>
        </div>

        {/* Member Perks Strip */}
        <div className="signup-perks">
          <div className="perk-item">
            <Truck className="perk-icon" />
            <span className="perk-text">Free Shipping</span>
          </div>
          <div className="perk-item">
            <Gift className="perk-icon" />
            <span className="perk-text">10% Welcome Gift</span>
          </div>
          <div className="perk-item">
            <ShieldCheck className="perk-icon" />
            <span className="perk-text">2-Year Warranty</span>
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
          {/* Full Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="register-email"
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
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="strength-meter">
                <div className="strength-bars">
                  <div className={`strength-bar ${strengthScore >= 1 ? getStrengthLabel().class : ''}`}></div>
                  <div className={`strength-bar ${strengthScore >= 2 ? getStrengthLabel().class : ''}`}></div>
                  <div className={`strength-bar ${strengthScore >= 3 ? getStrengthLabel().class : ''}`}></div>
                  <div className={`strength-bar ${strengthScore >= 4 ? getStrengthLabel().class : ''}`}></div>
                </div>
                <div className="strength-text">
                  <span>Strength</span>
                  <span className={`strength-score-label ${getStrengthLabel().class}`}>
                    {getStrengthLabel().text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMatch && (
              <p style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} /> Passwords match!
              </p>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="terms-group">
            <label className="terms-label">
              <input
                type="checkbox"
                className="terms-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </span>
            </label>
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
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Create My Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation to Login */}
        <div className="register-footer">
          Already have an account?
          <button
            type="button"
            className="signin-link"
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
