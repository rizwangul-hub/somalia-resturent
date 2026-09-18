import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCart } from '../hooks/useCart';
import { orderService, settingsService } from '../services/api';

export default function CartPage() {
  useDocumentTitle('AFLAX Restaurant — Dambiisha Dalabka');
  const {
    cartItems,
    customer,
    totalCount,
    totalAmount,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    updateCustomer,
  } = useCart();

  const [restaurantSettings, setRestaurantSettings] = useState({
    restaurantName: 'AFLAX Restaurant',
    phone: '61 0723233',
    whatsapp: '+252771989981',
    location: 'Degmada Yaqshiid, Somalia',
  });

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getPublicSettings()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setRestaurantSettings(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Multi-step order flow: 'cart' -> 'customer' -> 'review' -> 'success'
  const [currentStep, setCurrentStep] = useState('cart');

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Submission state & double-click protection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Validate Customer Form
  const validateCustomerForm = () => {
    const errors = {};
    if (!customer.name || customer.name.trim().length < 2) {
      errors.name = 'Fadlan geli magacaaga oo buuxa (ugu yaraan 2 xaraf)';
    }

    // Clean phone validation (digits and common phone characters)
    const cleanPhone = customer.phone.replace(/[\s-+()]/g, '');
    if (!customer.phone || cleanPhone.length < 6) {
      errors.phone = 'Fadlan geli lambar telefoon oo sax ah (ugu yaraan 6 lambar)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToCustomer = () => {
    if (cartItems.length === 0) return;
    setCurrentStep('customer');
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (validateCustomerForm()) {
      setSubmitError(null);
      setCurrentStep('review');
    }
  };

  const handleBackToCart = () => {
    setSubmitError(null);
    setCurrentStep('cart');
  };

  const handleBackToCustomer = () => {
    setSubmitError(null);
    setCurrentStep('customer');
  };

  // Submit order to Backend API
  const handleConfirmAndSubmitOrder = async () => {
    // 1. Prevent double submission
    if (isSubmitting) return;

    if (cartItems.length === 0) {
      setSubmitError('Dambiishaadu waa madhan tahay. Fadlan ku dar cuntooyin ka hor inta aadan dalban.');
      return;
    }

    if (!validateCustomerForm()) {
      setCurrentStep('customer');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 2. Prepare order payload (Backend performs trusted price calculation)
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          notes: customer.notes ? customer.notes.trim() : '',
        },
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.create(payload);

      if (response && response.success && response.data) {
        // 3. Save confirmed order data from server
        setConfirmedOrder(response.data);
        // 4. Clear cart ONLY after verified successful database save
        clearCart();
        // 5. Advance to success / WhatsApp dispatch screen
        setCurrentStep('success');
      } else {
        throw new Error(response?.message || 'Dalabka lama diiwaangelin karin');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError(
        err.message || 'Khalad ayaa dhacay xilliga dalabka la dirayey. Fadlan hubi macluumaadkaaga oo dib u tijaabi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open WhatsApp with server-generated URL
  const handleOpenWhatsApp = () => {
    if (confirmedOrder?.whatsappUrl) {
      window.open(confirmedOrder.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Start a new order
  const handleStartNewOrder = () => {
    setConfirmedOrder(null);
    setSubmitError(null);
    setCurrentStep('cart');
  };

  // ================= STATE 1: EMPTY CART =================
  if (cartItems.length === 0 && currentStep === 'cart') {
    return (
      <section className="cart-section">
        <div className="container">
          <div className="section-title">
            <span className="section-badge-gold">DALABKAAGA</span>
            <h2>Dambiisha Cuntada</h2>
          </div>

          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h3>Dambiishaadu waa madhan tahay</h3>
            <p>
              Ma jiraan cuntooyin aad hadda ku dartay dambiishaada.
              <br />
              Fadlan dooro cuntooyinka aad jeceshahay si aad u dalbato.
            </p>
            <Link to="/menu" className="hero-btn primary" style={{ marginTop: '20px' }}>
              🍽️ Eeg Menu-ga AFLAX
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <span className="section-badge-gold">DALABKAAGA</span>
          <h2>Dambiisha & Dalbashada</h2>
          <p>AFLAX Restaurant — Degmada Yaqshiid, Muqdisho</p>
        </div>

        {/* Step Indicator (4 Steps) */}
        <div className="cart-steps-indicator">
          <div className={`step-item ${currentStep === 'cart' ? 'active' : 'completed'}`}>
            <span className="step-num">1</span>
            <span className="step-label">Dambiisha ({totalCount})</span>
          </div>
          <div className="step-connector"></div>
          <div
            className={`step-item ${
              currentStep === 'customer'
                ? 'active'
                : currentStep === 'review' || currentStep === 'success'
                ? 'completed'
                : ''
            }`}
          >
            <span className="step-num">2</span>
            <span className="step-label">Macluumaadka</span>
          </div>
          <div className="step-connector"></div>
          <div
            className={`step-item ${
              currentStep === 'review' ? 'active' : currentStep === 'success' ? 'completed' : ''
            }`}
          >
            <span className="step-num">3</span>
            <span className="step-label">Dib-u-eegis</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step-item ${currentStep === 'success' ? 'active' : ''}`}>
            <span className="step-num">4</span>
            <span className="step-label">WhatsApp</span>
          </div>
        </div>

        {/* ================= STEP 1: CART ITEMS REVIEW ================= */}
        {currentStep === 'cart' && (
          <div className="cart-layout-grid">
            {/* Left: Cart Items List */}
            <div className="cart-items-container">
              <div className="cart-header-actions">
                <h3>Cuntooyinka aad dooratay ({totalCount})</h3>
                <button type="button" className="clear-cart-btn" onClick={clearCart}>
                  🗑️ Faaruqi Dambiisha
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const subtotal = (item.price * item.quantity).toFixed(2);

                  return (
                    <div key={item.menuItemId} className="cart-item-row">
                      <div className="cart-item-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="cart-thumb-placeholder">🍽️</div>
                        )}
                      </div>

                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        {item.categoryName && (
                          <span className="cart-item-category">{item.categoryName}</span>
                        )}
                        <span className="cart-item-unit-price">${item.price.toFixed(2)} USD</span>
                      </div>

                      <div className="cart-qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Iska dhim tirada"
                          onClick={() => decrementQuantity(item.menuItemId)}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Ku dar tirada"
                          onClick={() => incrementQuantity(item.menuItemId)}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span className="subtotal-label">Isugeyn:</span>
                        <span className="subtotal-amount">${subtotal}</span>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        aria-label="Ka saar cuntadan dambiisha"
                        onClick={() => removeFromCart(item.menuItemId)}
                      >
                        ✕ Ka saar
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-bottom-nav">
                <Link to="/menu" className="secondary-btn">
                  ← Sii wad doorashada cuntada
                </Link>
              </div>
            </div>

            {/* Right: Cart Summary Sidebar */}
            <div className="cart-summary-sidebar">
              <div className="summary-card">
                <h3>Xisaabta Dalabka</h3>

                <div className="summary-row">
                  <span>Tirada cuntooyinka:</span>
                  <span>{totalCount} xabbadood</span>
                </div>

                <div className="summary-row">
                  <span>Isugeynta lacagta:</span>
                  <span>${totalAmount.toFixed(2)} USD</span>
                </div>

                <div className="summary-row note">
                  <span>Adeegga & Canshuurta:</span>
                  <span>$0.00 (Bilaash)</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Wadarta Guud:</span>
                  <span className="total-highlight">${totalAmount.toFixed(2)} USD</span>
                </div>

                <button
                  type="button"
                  className="hero-btn primary checkout-btn"
                  onClick={handleProceedToCustomer}
                >
                  U gudub Macluumaadka →
                </button>

                <p className="summary-security-note">
                  🔒 Dalabkaagu wuxuu si toos ah u gaarayaa shaqaalaha AFLAX Restaurant.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CUSTOMER INFORMATION ================= */}
        {currentStep === 'customer' && (
          <div className="customer-form-layout">
            <div className="customer-form-card">
              <div className="form-header">
                <h3>👤 Macluumaadkaaga Dalbashada</h3>
                <p>
                  Fadlan geli magacaaga iyo telefoonkaaga si aan kuugu xaqiijino dalabkaaga cuntada.
                </p>
              </div>

              <form onSubmit={handleProceedToReview} className="customer-form" noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="customer-name">
                    Magacaaga oo buuxa <span className="req">*</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="Tusaale: Axmed Cabdi Cali"
                    value={customer.name}
                    onChange={(e) => updateCustomer({ name: e.target.value })}
                    className={formErrors.name ? 'input-error' : ''}
                    autoFocus
                  />
                  {formErrors.name && (
                    <span className="error-message">{formErrors.name}</span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label htmlFor="customer-phone">
                    Lambarka Telefoonka <span className="req">*</span>
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    placeholder="Tusaale: 061 2911079 ama +252 61..."
                    value={customer.phone}
                    onChange={(e) => updateCustomer({ phone: e.target.value })}
                    className={formErrors.phone ? 'input-error' : ''}
                  />
                  {formErrors.phone && (
                    <span className="error-message">{formErrors.phone}</span>
                  )}
                  <small className="field-hint">
                    Waxaa loo isticmaali doonaa xiriirka diyaarinta iyo keenista cuntada.
                  </small>
                </div>

                {/* Special Instructions / Notes */}
                <div className="form-group">
                  <label htmlFor="customer-notes">
                    Faahfaahin dheeraad ah (ikhtiyaari)
                  </label>
                  <textarea
                    id="customer-notes"
                    rows="3"
                    placeholder="Tusaale: Fadlan basbaas ha ku darin / Waxaan rabaa maraq dheeraad ah..."
                    value={customer.notes}
                    onChange={(e) => updateCustomer({ notes: e.target.value })}
                  />
                </div>

                {/* Form Buttons */}
                <div className="form-actions-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBackToCart}
                  >
                    ← Dib ugu noqo Dambiisha
                  </button>
                  <button type="submit" className="hero-btn primary">
                    U gudub Dib-u-eegista Dalabka →
                  </button>
                </div>
              </form>
            </div>

            {/* Restaurant Quick Contact Card */}
            <div className="restaurant-contact-sidebar">
              <div className="contact-side-card">
                <h4>🍽️ {restaurantSettings.restaurantName || 'AFLAX Restaurant'}</h4>
                <p className="contact-loc">📍 {restaurantSettings.location || 'Degmada Yaqshiid, Muqdisho, Somalia'}</p>
                <div className="contact-line">
                  <span>📞 Telefoon:</span>
                  <strong>{restaurantSettings.phone || '61 0723233'}</strong>
                </div>
                <div className="contact-line">
                  <span>💬 WhatsApp:</span>
                  <strong>{restaurantSettings.whatsapp || '+252 77 1989981'}</strong>
                </div>
                <div className="contact-tip">
                  💡 Dalabkaaga waxaa si toos ah loogu gudbin doonaa WhatsApp-ka maqaayadda marka aad
                  xaqiijiso.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ORDER REVIEW & CONFIRM ================= */}
        {currentStep === 'review' && (
          <div className="order-review-layout">
            <div className="order-review-card">
              <div className="review-header">
                <h3>🔍 Hubi Xogta Dalabkaaga ka hor inta aadan dirin</h3>
                <p>Fadlan xaqiiji in magacaaga, taleefankaaga, iyo cuntooyinkaagu ay sax yihiin.</p>
              </div>

              {/* Customer Box */}
              <div className="review-box customer-review-box">
                <div className="review-box-header">
                  <h4>👤 Macluumaadka Macaamiilka</h4>
                </div>
                <div className="customer-info-grid">
                  <div>
                    <span className="info-label">Magaca:</span>
                    <span className="info-value">{customer.name}</span>
                  </div>
                  <div>
                    <span className="info-label">Telefoonka:</span>
                    <span className="info-value">{customer.phone}</span>
                  </div>
                  {customer.notes && (
                    <div className="full-width">
                      <span className="info-label">Faahfaahin:</span>
                      <span className="info-value notes">{customer.notes}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="edit-section-btn"
                  onClick={handleBackToCustomer}
                  disabled={isSubmitting}
                >
                  ✏️ Wax ka beddel Macluumaadka
                </button>
              </div>

              {/* Items Box */}
              <div className="review-box items-review-box">
                <h4>🍽️ Cuntooyinka La Dalbanayo</h4>
                <div className="review-items-table">
                  <div className="table-header">
                    <span>Cuntada</span>
                    <span className="text-center">Tirada</span>
                    <span className="text-right">Qiimaha</span>
                    <span className="text-right">Isugeyn</span>
                  </div>

                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="table-row">
                      <span className="item-name-cell">
                        {item.name}
                        {item.categoryName && (
                          <small className="cell-cat"> ({item.categoryName})</small>
                        )}
                      </span>
                      <span className="text-center font-bold">× {item.quantity}</span>
                      <span className="text-right">${item.price.toFixed(2)}</span>
                      <span className="text-right font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="review-total-bar">
                  <div className="review-total-row">
                    <span>Tirada Guud:</span>
                    <span>{totalCount} xabbadood</span>
                  </div>
                  <div className="review-total-row grand-total">
                    <span>Wadarta Guud:</span>
                    <span className="grand-price">${totalAmount.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="edit-section-btn"
                  onClick={handleBackToCart}
                  disabled={isSubmitting}
                >
                  ✏️ Wax ka beddel Cuntooyinka
                </button>
              </div>

              {/* Submission Error Banner */}
              {submitError && (
                <div className="order-error-banner">
                  <span className="error-icon">⚠️</span>
                  <div>
                    <strong>Khalad ayaa dhacay:</strong> {submitError}
                    <p>Dambiishaada lama tirtirin. Fadlan sax khaladka oo dib u tijaabi.</p>
                  </div>
                </div>
              )}

              {/* Actions: Confirm Order & Double Click Protection */}
              <div className="review-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleBackToCustomer}
                  disabled={isSubmitting}
                >
                  ← Dib ugu noqo
                </button>
                <button
                  type="button"
                  className="hero-btn primary place-order-submit-btn"
                  onClick={handleConfirmAndSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-mini"></span> Fadlan sug... Dalabkaaga waa la
                      dirayaa...
                    </>
                  ) : (
                    <>🚀 Xaqiiji & Dalbo (Diiwaangeli Dalabka)</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ORDER CONFIRMED & WHATSAPP DISPATCH ================= */}
        {currentStep === 'success' && confirmedOrder && (
          <div className="order-success-layout">
            <div className="order-success-card">
              {/* Success Badge */}
              <div className="success-badge-header">
                <div className="success-check-icon">✓</div>
                <h3>Dalabkaaga si guul leh ayaa loo diiwaangeliyey!</h3>
                <p>
                  Nidaamka AFLAX Restaurant wuxuu qabtay dalabkaaga. Fadlan hadda riix batoonka cagaaran ee hoose si
                  dalabka loogu diro WhatsApp-ka maqaayadda looguna bilaabo diyaarinta.
                </p>
              </div>

              {/* Order Key Details */}
              <div className="confirmed-details-card">
                <div className="detail-pill-row">
                  <div className="detail-pill">
                    <span className="pill-label">🧾 Lambarka Dalabka</span>
                    <strong className="pill-val order-code">{confirmedOrder.orderNumber}</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">💰 Wadarta Guud</span>
                    <strong className="pill-val order-price">
                      ${Number(confirmedOrder.total).toFixed(2)} USD
                    </strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">👤 Macaamiilka</span>
                    <strong className="pill-val">
                      {confirmedOrder.customer.name} ({confirmedOrder.customer.phone})
                    </strong>
                  </div>
                </div>

                {/* Ordered Items Summary */}
                <div className="confirmed-items-list">
                  <h4>🍽️ Cuntooyinka La Diiwaangeliyey:</h4>
                  <ul>
                    {confirmedOrder.items.map((item, idx) => (
                      <li key={idx}>
                        <span>
                          <strong>{item.name}</strong> × {item.quantity}
                        </span>
                        <span className="item-sub-price">
                          ${Number(item.subtotal).toFixed(2)} USD
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WhatsApp Message Preview Box */}
                <div className="whatsapp-preview-container">
                  <div className="whatsapp-preview-header">
                    <span>📱 Fariinta loo diri doono AFLAX Restaurant:</span>
                  </div>
                  <pre className="whatsapp-preview-box">{confirmedOrder.whatsappMessage}</pre>
                </div>

                {/* WhatsApp Dispatch CTA */}
                <div className="whatsapp-action-section">
                  <button
                    type="button"
                    className="whatsapp-dispatch-btn"
                    onClick={handleOpenWhatsApp}
                  >
                    <span className="wa-icon">💬</span>
                    <span className="wa-text">
                      WhatsApp-ka u dir dalabka (+252 77 1989981)
                    </span>
                  </button>
                  <small className="wa-hint">
                    Markaad riixdo, WhatsApp ayaa kuu furmi doona adigoo toos ugu diraya maqaayadda.
                  </small>
                </div>

                {/* Next Steps Nav */}
                <div className="confirmed-nav-row">
                  <Link to="/menu" className="hero-btn secondary" onClick={handleStartNewOrder}>
                    🍽️ Dalbo Cunto Kale (Ku Noqo Menu-ga)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
