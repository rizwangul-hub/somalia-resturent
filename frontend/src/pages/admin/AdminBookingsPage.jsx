import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/api';

const BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = String(m).padStart(2, '0');
      return `${displayH}:${displayM} ${period}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export default function AdminBookingsPage() {
  useDocumentTitle('AFLAX Restaurant — Maamulka Ballamaha');
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'upcoming', 'custom'
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Booking for Detail Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const fetchBookings = async (targetPage = pagination.page, isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const params = {
        page: targetPage,
        limit: 20,
        search,
        status: statusFilter,
        dateFilter,
      };
      if (dateFilter === 'custom' && customDate) {
        params.date = customDate;
      }

      const res = await adminService.getBookings(params);

      if (res && res.success) {
        setBookings(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Unable to load bookings from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter, customDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBookings(newPage);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (updatingBookingId) return; // Prevent duplicate concurrent requests
    setUpdatingBookingId(bookingId);
    setFeedback(null);

    const bookingToUpdate = bookings.find((b) => b._id === bookingId);
    const bookingNumber = bookingToUpdate?.bookingNumber || 'Booking';

    try {
      const res = await adminService.updateBookingStatus(bookingId, newStatus);
      if (res && res.success && res.data) {
        const updated = res.data;
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: updated.status } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking((prev) => ({ ...prev, status: updated.status }));
        }

        const statusLabel =
          BOOKING_STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;
        setFeedback({
          type: 'success',
          message: `${bookingNumber} status updated to "${statusLabel}" successfully.`,
        });
      } else {
        throw new Error(res?.message || 'Failed to update booking status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setFeedback({
        type: 'error',
        message: `Failed to update ${bookingNumber}: ${err.message}`,
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  return (
    <div className="admin-bookings-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Table Bookings Management</h2>
          <p className="admin-page-subtitle">
            Review and manage customer table reservation requests saved in MongoDB
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={() => fetchBookings(pagination.page, true)}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div className={`admin-alert-banner ${feedback.type}`} role="alert">
          <span>
            {feedback.type === 'success' ? '✅ ' : '⚠️ '}
            {feedback.message}
          </span>
          <button
            type="button"
            className="admin-alert-dismiss"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="admin-controls-card">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <input
            type="text"
            placeholder="Search by Booking # (AFLAX-BXXXXXX), Customer Name, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="admin-search-btn">
            🔍 Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-clear-btn"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('all');
                setCustomDate('');
                setTimeout(() => fetchBookings(1), 0);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter */}
          <div className="admin-filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Statuses</option>
              {BOOKING_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="admin-filter-group">
            <label htmlFor="date-filter">Date:</label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="custom">Specific Date</option>
            </select>

            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="admin-date-input"
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading bookings from database...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <span className="error-icon">⚠️</span>
          <h3>Error loading bookings</h3>
          <p>{error}</p>
          <button type="button" className="hero-btn primary" onClick={() => fetchBookings(1, true)}>
            🔄 Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="admin-empty-state">
          <span>📅</span>
          <h3>No bookings found</h3>
          <p>There are no table booking requests matching your search or filter criteria.</p>
        </div>
      ) : (
        <div className="admin-panel-card">
          {/* Desktop / Tablet Table View */}
          <div className="admin-table-wrapper admin-bookings-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Number</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isUpdating = updatingBookingId === b._id;

                  return (
                    <tr key={b._id}>
                      <td className="font-mono font-bold text-amber">{b.bookingNumber}</td>
                      <td>
                        <strong>{b.customerName}</strong>
                      </td>
                      <td>{b.phone}</td>
                      <td>{formatDisplayDate(b.date)}</td>
                      <td>{formatDisplayTime(b.time)}</td>
                      <td>
                        <strong>{b.numberOfGuests}</strong> guests
                      </td>
                      <td>
                        <div className="status-dropdown-wrapper">
                          <select
                            className={`status-dropdown status-${b.status}`}
                            value={b.status}
                            onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                            disabled={isUpdating}
                            aria-label={`Update status for ${b.bookingNumber}`}
                          >
                            {BOOKING_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {isUpdating && <span className="spinner-mini"></span>}
                        </div>
                      </td>
                      <td className="text-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => setSelectedBooking(b)}
                        >
                          👁️ Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Booking Cards */}
          <div className="admin-booking-cards-mobile">
            {bookings.map((b) => {
              const isUpdating = updatingBookingId === b._id;

              return (
                <div key={b._id} className="admin-booking-card">
                  <div className="admin-booking-card-header">
                    <span className="font-mono font-bold text-amber">{b.bookingNumber}</span>
                    <span className="admin-items-badge">{b.numberOfGuests} guests</span>
                  </div>
                  <div className="admin-booking-card-body">
                    <div>
                      <small className="text-muted">Customer:</small>
                      <div><strong>{b.customerName}</strong></div>
                    </div>
                    <div>
                      <small className="text-muted">Phone:</small>
                      <div>{b.phone}</div>
                    </div>
                    <div>
                      <small className="text-muted">Reservation:</small>
                      <div>{formatDisplayDate(b.date)} at {formatDisplayTime(b.time)}</div>
                    </div>
                    <div>
                      <small className="text-muted">Submitted:</small>
                      <div>{new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="admin-booking-card-footer">
                    <div className="status-dropdown-wrapper">
                      <select
                        className={`status-dropdown status-${b.status}`}
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                        disabled={isUpdating}
                        aria-label={`Update status for ${b.bookingNumber}`}
                      >
                        {BOOKING_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <span className="spinner-mini"></span>}
                    </div>
                    <button
                      type="button"
                      className="admin-view-btn"
                      onClick={() => setSelectedBooking(b)}
                    >
                      👁️ Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="admin-pagination-bar">
              <span className="pagination-info">
                Showing page <strong>{pagination.page}</strong> of{' '}
                <strong>{pagination.totalPages}</strong> ({pagination.total} total bookings)
              </span>
              <div className="pagination-buttons">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  ← Previous
                </button>
                <span className="current-page-display">{pagination.page}</span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Booking Details — {selectedBooking.bookingNumber}</h3>
                <span className="text-muted">
                  Submitted on {new Date(selectedBooking.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer & Reservation Details */}
              <div className="modal-info-section">
                <h4>👤 Reservation Information</h4>
                <div className="modal-grid-2">
                  <div>
                    <strong>Customer Name:</strong> {selectedBooking.customerName}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedBooking.phone}
                  </div>
                  <div>
                    <strong>Reserved Date:</strong> {formatDisplayDate(selectedBooking.date)} ({selectedBooking.date})
                  </div>
                  <div>
                    <strong>Reserved Time:</strong> {formatDisplayTime(selectedBooking.time)} ({selectedBooking.time})
                  </div>
                  <div>
                    <strong>Party Size:</strong> {selectedBooking.numberOfGuests} guests
                  </div>
                  <div>
                    <strong>Current Status:</strong>{' '}
                    <span className={`status-pill status-${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  {selectedBooking.notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Special Request / Notes:</strong>{' '}
                      <em>"{selectedBooking.notes}"</em>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              {selectedBooking.whatsappMessage && (
                <div className="modal-info-section">
                  <h4>📱 WhatsApp Customer Message</h4>
                  <pre className="admin-code-block">{selectedBooking.whatsappMessage}</pre>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <div className="modal-status-update">
                <span>Update Status:</span>
                <div className="status-dropdown-wrapper">
                  <select
                    className={`status-dropdown status-${selectedBooking.status}`}
                    value={selectedBooking.status}
                    onChange={(e) => handleUpdateStatus(selectedBooking._id, e.target.value)}
                    disabled={updatingBookingId === selectedBooking._id}
                    aria-label="Update modal booking status"
                  >
                    {BOOKING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {updatingBookingId === selectedBooking._id && (
                    <span className="spinner-mini"></span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
