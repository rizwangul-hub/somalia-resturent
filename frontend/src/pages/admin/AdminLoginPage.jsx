import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function AdminLoginPage() {
  useDocumentTitle('AFLAX Restaurant — Admin Login');
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and not loading, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your admin email address';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Please enter your password';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      // Generic error message prevents account enumeration
      setSubmitError(
        err.message || 'Invalid email or password. Please verify your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Header with Logo */}
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <span className="login-icon">🍽️</span>
            <div>
              <h2>AFLAX</h2>
              <span>ADMIN PORTAL</span>
            </div>
          </div>
          <p className="login-desc">Sign in to manage AFLAX Restaurant orders, bookings, and menu</p>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="order-error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Login Failed</strong>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. admin@aflax.so"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              className={errors.email ? 'input-error' : ''}
              autoFocus
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="hero-btn primary place-order-submit-btn admin-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-mini"></span> Verifying credentials...
              </>
            ) : (
              <>🔒 Log In to Admin</>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-site-link">
            ← Back to Customer Website
          </Link>
          <small className="login-security-notice">
            🔒 Protected area for authorized AFLAX Restaurant management only.
          </small>
        </div>
      </div>
    </div>
  );
}
