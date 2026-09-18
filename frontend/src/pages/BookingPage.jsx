import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { bookingService, settingsService } from '../services/api';

export default function BookingPage() {
  useDocumentTitle('AFLAX Restaurant — Dalbo Miis');
  // Helper to format today's date as YYYY-MM-DD for min date attribute
  const todayISO = new Date().toISOString().split('T')[0];

  const [restaurantSettings, setRestaurantSettings] = useState({
    restaurantName: 'AFLAX Restaurant',
    phone: '61 0723233',
    whatsapp: '+252610723233',
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

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    date: todayISO,
    time: '12:00',
    numberOfGuests: 2,
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!formData.customerName || formData.customerName.trim().length < 2) {
      errors.customerName = 'Fadlan geli magacaaga oo buuxa (ugu yaraan 2 xaraf)';
    }

    const cleanPhone = formData.phone.replace(/[\s-+()]/g, '');
    if (!formData.phone || cleanPhone.length < 6) {
      errors.phone = 'Fadlan geli lambar telefoon oo sax ah (ugu yaraan 6 lambar)';
    }

    if (!formData.date) {
      errors.date = 'Fadlan dooro taariikhda aad imaanayso';
    } else if (formData.date < todayISO) {
      errors.date = 'Taariikhdu ma noqon karto mid horey u soo martay (Past date)';
    }

    if (!formData.time) {
      errors.time = 'Fadlan dooro waqtiga aad imaanayso';
    }

    const guests = parseInt(formData.numberOfGuests, 10);
    if (isNaN(guests) || guests < 1) {
      errors.numberOfGuests = 'Tirada dadku waa inay noqotaa ugu yaraan 1 qof';
    } else if (guests > 50) {
      errors.numberOfGuests = 'Tirada dadku ma dhaafi karto 50 qof';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-level error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate clicks
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        date: formData.date.trim(),
        time: formData.time.trim(),
        numberOfGuests: parseInt(formData.numberOfGuests, 10),
        notes: formData.notes ? formData.notes.trim() : '',
      };

      const response = await bookingService.create(payload);

      if (response && response.success && response.data) {
        setConfirmedBooking(response.data);
      } else {
        throw new Error(response?.message || 'Codsiga ballansashada lama gudbin karin');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setSubmitError(
        err.message ||
          'Khalad ayaa dhacay xilliga codsiga la dirayey. Fadlan hubi khadkaaga internet-ka oo dib u tijaabi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dispatch to WhatsApp
  const handleOpenWhatsApp = () => {
    if (confirmedBooking?.whatsappUrl) {
      window.open(confirmedBooking.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Reset to book another table
  const handleReset = () => {
    setConfirmedBooking(null);
    setSubmitError(null);
    setFormData({
      customerName: '',
      phone: '',
      date: todayISO,
      time: '12:00',
      numberOfGuests: 2,
      notes: '',
    });
  };

  return (
    <section className="booking-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <span className="section-badge-gold">BALLANSO MIISKAAGA</span>
          <h2>Boos Qabashada AFLAX Restaurant</h2>
          <p>
            Ku raaxayso waqti wanaagsan adiga iyo qoyskaaga ama asxaabtaada. Fadlan noo soo dir codsigaaga
            si aan kuugu sii diyaarino miis kugu habboon.
          </p>
        </div>

        {/* State 1: Form View (When not yet submitted) */}
        {!confirmedBooking ? (
          <div className="booking-layout-grid">
            {/* Left: Booking Form */}
            <div className="booking-form-card">
              <div className="form-header">
                <h3>📅 Foomka Boos Qabashada Miiska</h3>
                <p>Buuxi macluumaadka hoose si aad u codsato miis.</p>
              </div>

              {submitError && (
                <div className="order-error-banner" role="alert">
                  <span className="error-icon">⚠️</span>
                  <div>
                    <strong>Khalad ayaa dhacay:</strong> {submitError}
                    <p>Fadlan sax macluumaadka kore oo dib u riix batoonka dalbashada.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="booking-form" noValidate>
                {/* Row 1: Name and Phone */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customerName">
                      Magacaaga oo buuxa <span className="req">*</span>
                    </label>
                    <input
                      id="customerName"
                      name="customerName"
                      type="text"
                      placeholder="Tusaale: Axmed Cabdi Cali"
                      value={formData.customerName}
                      onChange={handleChange}
                      className={formErrors.customerName ? 'input-error' : ''}
                      autoFocus
                    />
                    {formErrors.customerName && (
                      <span className="error-message">{formErrors.customerName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Lambarka Telefoonka <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Tusaale: 061 2911079"
                      value={formData.phone}
                      onChange={handleChange}
                      className={formErrors.phone ? 'input-error' : ''}
                    />
                    {formErrors.phone && (
                      <span className="error-message">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Row 2: Date, Time, and Number of Guests */}
                <div className="form-row three-cols">
                  <div className="form-group">
                    <label htmlFor="date">
                      Taariikhda <span className="req">*</span>
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      min={todayISO}
                      value={formData.date}
                      onChange={handleChange}
                      className={formErrors.date ? 'input-error' : ''}
                    />
                    {formErrors.date && (
                      <span className="error-message">{formErrors.date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">
                      Waqtiga <span className="req">*</span>
                    </label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={formErrors.time ? 'input-error' : ''}
                    />
                    {formErrors.time && (
                      <span className="error-message">{formErrors.time}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="numberOfGuests">
                      Tirada Dadka <span className="req">*</span>
                    </label>
                    <input
                      id="numberOfGuests"
                      name="numberOfGuests"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                      className={formErrors.numberOfGuests ? 'input-error' : ''}
                    />
                    {formErrors.numberOfGuests && (
                      <span className="error-message">{formErrors.numberOfGuests}</span>
                    )}
                  </div>
                </div>

                {/* Row 3: Special Notes */}
                <div className="form-group">
                  <label htmlFor="notes">Fariin ama Codsi Gaar ah (ikhtiyaari)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    placeholder="Tusaale: Waxaan doonaynaa miis geeska ah / Xaflad dhalasho / Kuraas dheeraad ah..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Disclaimer / Booking Note */}
                <div className="booking-info-notice">
                  <span className="notice-icon">ℹ️</span>
                  <p>
                    <strong>Fiiro gaar ah:</strong> Codsigaagu wuxuu noqonayaa mid la diiwaangeliyey oo sugaya
                    xaqiijin (Pending). Fadlan riix batoonka si codsiga loogu gudbiyo maqaayadda ka dibna
                    fariinta loogu diro WhatsApp.
                  </p>
                </div>

                {/* Action Button with Duplicate Click Protection */}
                <div className="booking-submit-row">
                  <button
                    type="submit"
                    className="hero-btn primary place-order-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-mini"></span> Fadlan sug... Codsigaaga waa la
                        dirayaa...
                      </>
                    ) : (
                      <>Miis Dalbo (Gudbi Codsiga) 📅</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Restaurant Details Sidebar */}
            <div className="booking-info-sidebar">
              <div className="contact-side-card">
                <h4>🍽️ {restaurantSettings.restaurantName || 'AFLAX Restaurant'}</h4>
                <p className="contact-loc">📍 {restaurantSettings.location || 'Degmada Yaqshiid, Muqdisho, Somalia'}</p>
                <div className="contact-line">
                  <span>📞 Telefoon:</span>
                  <strong>{restaurantSettings.phone || '61 0723233'}</strong>
                </div>
                <div className="contact-line">
                  <span>💬 WhatsApp:</span>
                  <strong>{restaurantSettings.whatsapp || '+252610723233'}</strong>
                </div>
                <div className="contact-tip">
                  💡 Ka dib markii aad codsato, waxaad heli doontaa fariin toos ah oo aad WhatsApp ugu
                  diri karto maqaayadda si laguu xaqiijiyo.
                </div>
              </div>

              <div className="booking-perks-card">
                <h4>✨ Maxaad U Dooranaysaa AFLAX?</h4>
                <ul>
                  <li>✔️ Cuntooyin tayo sare leh oo nadaafadooda la ilaaliyey</li>
                  <li>✔️ Meel degan oo ku habboon qoysaska iyo asxaabta</li>
                  <li>✔️ Shaqaale furfuran oo diyaar u ah adeeggaaga</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Booking Request Submitted View (DOES NOT CLAIM CONFIRMED) */
          <div className="order-success-layout">
            <div className="order-success-card">
              {/* Request Submitted Badge */}
              <div className="success-badge-header">
                <div className="success-check-icon">📅</div>
                <h3>Codsigaga ballansashada miiska si guul leh ayaa loo gudbiyey!</h3>
                <p className="pending-status-notice">
                  <strong>Fadlan ogow:</strong> Miiskaagu hadda waa <em>codsi sugaya xaqiijin (Pending Request)</em>.
                  Fadlan riix batoonka cagaaran ee hoose si aad faahfaahinta ugu dirto WhatsApp-ka maqaayadda
                  si laguugu xaqiijiyo.
                </p>
              </div>

              {/* Booking Key Details */}
              <div className="confirmed-details-card">
                <div className="detail-pill-row">
                  <div className="detail-pill">
                    <span className="pill-label">🔖 Lambarka Ballanta</span>
                    <strong className="pill-val order-code">{confirmedBooking.bookingNumber}</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">📅 Taariikhda</span>
                    <strong className="pill-val">{confirmedBooking.formattedDate || confirmedBooking.date}</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">⏰ Waqtiga</span>
                    <strong className="pill-val">{confirmedBooking.formattedTime || confirmedBooking.time}</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">👥 Tirada Dadka</span>
                    <strong className="pill-val">{confirmedBooking.numberOfGuests} qof</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">👤 Magaca</span>
                    <strong className="pill-val">{confirmedBooking.customerName}</strong>
                  </div>
                  <div className="detail-pill">
                    <span className="pill-label">📞 Telefoonka</span>
                    <strong className="pill-val">{confirmedBooking.phone}</strong>
                  </div>
                </div>

                {confirmedBooking.notes && (
                  <div className="booking-notes-pill">
                    <span className="pill-label">📝 Codsi Gaar ah:</span>
                    <p>{confirmedBooking.notes}</p>
                  </div>
                )}

                {/* WhatsApp Message Preview Box */}
                <div className="whatsapp-preview-container">
                  <div className="whatsapp-preview-header">
                    <span>📱 Fariinta WhatsApp-ka loo diri doono AFLAX Restaurant:</span>
                  </div>
                  <pre className="whatsapp-preview-box">{confirmedBooking.whatsappMessage}</pre>
                </div>

                {/* WhatsApp Dispatch Button */}
                <div className="whatsapp-action-section">
                  <button
                    type="button"
                    className="whatsapp-dispatch-btn"
                    onClick={handleOpenWhatsApp}
                  >
                    <span className="wa-icon">💬</span>
                    <span className="wa-text">
                      WhatsApp-ka u dir ballanta (+252610723233)
                    </span>
                  </button>
                  <small className="wa-hint">
                    Markaad riixdo, WhatsApp ayaa kuu furmi doona adigoo toos ugu diraya maqaayadda si
                    laguugu xaqiijiyo.
                  </small>
                </div>

                {/* Nav Row */}
                <div className="confirmed-nav-row" style={{ gap: '15px', flexWrap: 'wrap' }}>
                  <button type="button" className="secondary-btn" onClick={handleReset}>
                    📅 Samee Ballan Kale
                  </button>
                  <Link to="/menu" className="hero-btn secondary">
                    🍽️ Eeg Menu-ga AFLAX
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
