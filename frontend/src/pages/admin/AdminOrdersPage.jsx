import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/api';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  useDocumentTitle('AFLAX Restaurant — Maamulka Dalabaadka');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const fetchOrders = async (targetPage = pagination.page, isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await adminService.getOrders({
        page: targetPage,
        limit: 20,
        search,
        status: statusFilter,
      });

      if (res && res.success) {
        setOrders(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Unable to load orders from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (updatingOrderId) return; // Prevent duplicate concurrent requests
    setUpdatingOrderId(orderId);
    setFeedback(null);

    const orderToUpdate = orders.find((o) => o._id === orderId);
    const orderNumber = orderToUpdate?.orderNumber || 'Order';

    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res && res.success && res.data) {
        const updatedOrder = res.data;
        // Immediate UI update
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: updatedOrder.status } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: updatedOrder.status }));
        }

        const statusLabel =
          ORDER_STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;
        setFeedback({
          type: 'success',
          message: `${orderNumber} status updated to "${statusLabel}" successfully.`,
        });
      } else {
        throw new Error(res?.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setFeedback({
        type: 'error',
        message: `Failed to update ${orderNumber}: ${err.message}`,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Orders Management</h2>
          <p className="admin-page-subtitle">
            Track, verify, and update real customer orders saved in MongoDB
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={() => fetchOrders(pagination.page, true)}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Feedback Banner (Success / Error) */}
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
            placeholder="Search by Order # (AFLAX-XXXXXX), Customer Name, or Phone..."
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
                setTimeout(() => fetchOrders(1), 0);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading orders from database...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <span className="error-icon">⚠️</span>
          <h3>Error loading orders</h3>
          <p>{error}</p>
          <button type="button" className="hero-btn primary" onClick={() => fetchOrders(1, true)}>
            🔄 Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty-state">
          <span>🧾</span>
          <h3>No orders found</h3>
          <p>There are no orders matching your search or filter criteria.</p>
        </div>
      ) : (
        <div className="admin-panel-card">
          {/* Desktop / Tablet Table View */}
          <div className="admin-table-wrapper admin-orders-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const totalUnits = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <tr key={order._id}>
                      <td className="font-mono font-bold text-amber">{order.orderNumber}</td>
                      <td>
                        <strong>{order.customer?.name}</strong>
                      </td>
                      <td>{order.customer?.phone}</td>
                      <td>
                        <span className="admin-items-badge">
                          {order.items?.length} items ({totalUnits} pcs)
                        </span>
                      </td>
                      <td className="font-bold text-emerald">
                        ${Number(order.total).toFixed(2)} USD
                      </td>
                      <td>
                        <div className="status-dropdown-wrapper">
                          <select
                            className={`status-dropdown status-${order.status}`}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            disabled={isUpdating}
                            aria-label={`Update status for ${order.orderNumber}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {isUpdating && <span className="spinner-mini"></span>}
                        </div>
                      </td>
                      <td className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => setSelectedOrder(order)}
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

          {/* Mobile Responsive Order Cards */}
          <div className="admin-order-cards-mobile">
            {orders.map((order) => {
              const totalUnits = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
              const isUpdating = updatingOrderId === order._id;

              return (
                <div key={order._id} className="admin-order-card">
                  <div className="admin-order-card-header">
                    <span className="font-mono font-bold text-amber">{order.orderNumber}</span>
                    <span className="font-bold text-emerald">${Number(order.total).toFixed(2)} USD</span>
                  </div>
                  <div className="admin-order-card-body">
                    <div>
                      <small className="text-muted">Customer:</small>
                      <div><strong>{order.customer?.name}</strong></div>
                    </div>
                    <div>
                      <small className="text-muted">Phone:</small>
                      <div>{order.customer?.phone}</div>
                    </div>
                    <div>
                      <small className="text-muted">Items:</small>
                      <div>{order.items?.length} items ({totalUnits} pcs)</div>
                    </div>
                    <div>
                      <small className="text-muted">Date:</small>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="admin-order-card-footer">
                    <div className="status-dropdown-wrapper">
                      <select
                        className={`status-dropdown status-${order.status}`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={isUpdating}
                        aria-label={`Update status for ${order.orderNumber}`}
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
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
                      onClick={() => setSelectedOrder(order)}
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
                <strong>{pagination.totalPages}</strong> ({pagination.total} total orders)
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Order Details — {selectedOrder.orderNumber}</h3>
                <span className="text-muted">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer Info Section */}
              <div className="modal-info-section">
                <h4>👤 Customer Information</h4>
                <div className="modal-grid-2">
                  <div>
                    <strong>Name:</strong> {selectedOrder.customer?.name}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedOrder.customer?.phone}
                  </div>
                  {selectedOrder.customer?.notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Notes:</strong> <em>"{selectedOrder.customer?.notes}"</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="modal-info-section">
                <h4>🍽️ Ordered Items ({selectedOrder.items?.length || 0})</h4>
                <div className="order-items-container">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="order-item-card">
                      <div className="order-item-left">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-formula">
                          Qty: {item.quantity} &nbsp;•&nbsp; ${Number(item.price).toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                      <div className="order-item-right">
                        <span className="order-item-subtotal">
                          ${Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Server Calculated Total Banner */}
                <div className="order-modal-total-banner">
                  <span>Server-Calculated Order Total:</span>
                  <span className="order-modal-total-amount">
                    ${Number(selectedOrder.total).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              {selectedOrder.whatsappMessage && (
                <div className="modal-info-section">
                  <h4>📱 WhatsApp Customer Message</h4>
                  <pre className="admin-code-block">{selectedOrder.whatsappMessage}</pre>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <div className="modal-status-update">
                <span>Update Status:</span>
                <div className="status-dropdown-wrapper">
                  <select
                    className={`status-dropdown status-${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    disabled={updatingOrderId === selectedOrder._id}
                    aria-label="Update modal order status"
                  >
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === selectedOrder._id && (
                    <span className="spinner-mini"></span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedOrder(null)}
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
