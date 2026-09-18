import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/api';

export default function AdminSettingsPage() {
  useDocumentTitle('AFLAX Restaurant — Habaynta Maqaayadda');
  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: '',
    whatsapp: '',
    location: '',
    currency: 'USD',
    description: '',
    logo: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSettings = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await adminService.getSettings();
      if (res && res.success && res.data) {
        const d = res.data;
        setFormData({
          restaurantName: d.restaurantName || '',
          phone: d.phone || '',
          whatsapp: d.whatsapp || '',
          location: d.location || '',
          currency: d.currency || 'USD',
          description: d.description || '',
          logo: '', // keep empty so existing image is preserved unless replaced
        });
        setLogoPreview(d.logo || '');
      } else {
        throw new Error(res?.message || 'Failed to load restaurant settings');
      }
    } catch (err) {
      console.error('Settings load error:', err);
      setError(err.message || 'Unable to fetch restaurant settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminService
      .getSettings()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          const d = res.data;
          setFormData({
            restaurantName: d.restaurantName || '',
            phone: d.phone || '',
            whatsapp: d.whatsapp || '',
            location: d.location || '',
            currency: d.currency || 'USD',
            description: d.description || '',
            logo: '',
          });
          setLogoPreview(d.logo || '');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Unable to fetch restaurant settings');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (!formData.restaurantName.trim()) {
        throw new Error('Restaurant name is required');
      }
      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!formData.whatsapp.trim()) {
        throw new Error('WhatsApp number is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }

      const payload = {
        restaurantName: formData.restaurantName.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        location: formData.location.trim(),
        currency: (formData.currency || 'USD').trim().toUpperCase(),
        description: formData.description.trim(),
      };

      if (formData.logo) {
        payload.logo = formData.logo;
      }

      const res = await adminService.updateSettings(payload);
      if (res && res.success && res.data) {
        setSuccessMessage('Restaurant settings updated successfully!');
        setInitialData(res.data);
        if (res.data.logo) {
          setLogoPreview(res.data.logo);
        }
        setFormData((prev) => ({ ...prev, logo: '' }));
      } else {
        throw new Error(res?.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading Restaurant Settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Restaurant Settings & Content</h2>
          <p className="admin-page-subtitle">
            Manage official AFLAX Restaurant information, contact channels, location, and branding
          </p>
        </div>
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={fetchSettings}
          disabled={saving}
        >
          🔄 Refresh
        </button>
      </div>

      {successMessage && (
        <div
          className="admin-success-banner"
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div
          className="admin-error-banner"
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="admin-panel-card" style={{ maxWidth: '800px', padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          {/* Restaurant Identity Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="settings-name">
                Restaurant Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="settings-name"
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) =>
                  setFormData({ ...formData, restaurantName: e.target.value })
                }
                placeholder="e.g. AFLAX Restaurant"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="settings-currency">
                Default Currency <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="settings-currency"
                type="text"
                required
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                }
                placeholder="USD"
                disabled
                title="AFLAX Restaurant operates in USD"
              />
            </div>
          </div>

          {/* Contact Details Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="settings-phone">
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="settings-phone"
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. 61 0723233"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="settings-whatsapp">
                WhatsApp Destination Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="settings-whatsapp"
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="e.g. +252610723233"
              />
              <small style={{ fontSize: '11px', color: '#6b7280' }}>
                Used for direct customer food orders and table reservation messages
              </small>
            </div>
          </div>

          {/* Location */}
          <div className="admin-form-group">
            <label htmlFor="settings-location">
              Restaurant Location <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="settings-location"
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Degmada Yaqshiid, Somalia"
            />
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label htmlFor="settings-desc">Restaurant Description (Optional)</label>
            <textarea
              id="settings-desc"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Short restaurant introduction or mission statement..."
            />
          </div>

          {/* Logo Upload with Preview */}
          <div className="admin-form-group" style={{ marginTop: '20px' }}>
            <label>Restaurant Logo</label>
            <div className="admin-image-upload-box">
              <div
                className="admin-preview-wrapper"
                style={{ width: '100px', height: '100px', borderRadius: '12px' }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Restaurant Logo" className="admin-preview-img" />
                ) : (
                  <span className="admin-preview-placeholder">🍽️</span>
                )}
              </div>
              <div className="admin-file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                />
                <p className="admin-file-help">
                  Upload a restaurant logo (PNG, JPG, SVG up to 5MB). Leave empty to preserve the existing logo.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={saving}
              style={{ padding: '10px 24px' }}
            >
              {saving ? 'Saving Settings...' : '💾 Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
