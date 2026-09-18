import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/api';

export default function AdminDashboardPage() {
  useDocumentTitle('AFLAX Restaurant — Admin Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('month'); // 'today' | 'week' | 'month' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const params = { range };
      if (range === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      }
      const res = await adminService.getAnalytics(params);
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to load analytics overview');
      }
    } catch (err) {
      console.error('Admin analytics error:', err);
      setError(err.message || 'Unable to load analytics data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    fetchAnalytics(true);
  };

  if (loading && !data) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading AFLAX Analytics & Reports...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-error-card">
        <span className="error-icon">⚠️</span>
        <h3>Failed to load Analytics</h3>
        <p>{error}</p>
        <button type="button" className="hero-btn primary" onClick={() => fetchAnalytics(true)}>
          🔄 Retry
        </button>
      </div>
    );
  }

  const {
    summary = {},
    orders = {},
    sales = {},
    bookings = {},
    popularItems = [],
    timeline = [],
    recentOrders = [],
    upcomingBookings = [],
  } = data || {};

  // Maximum values for SVG charts
  const maxSales = timeline.length > 0 ? Math.max(...timeline.map((t) => t.sales), 10) : 10;
  const maxPopularQty = popularItems.length > 0 ? Math.max(...popularItems.map((p) => p.quantity), 1) : 1;

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Analytics & Dashboard Overview</h2>
          <p className="admin-page-subtitle">
            Live operational intelligence and verified sales reports for AFLAX Restaurant
          </p>
        </div>
        <button type="button" className="admin-refresh-btn" onClick={() => fetchAnalytics(true)}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Date Range Control Bar */}
      <div className="admin-analytics-controls">
        <div className="admin-range-selector">
          <button
            type="button"
            className={`admin-range-btn ${range === 'today' ? 'active' : ''}`}
            onClick={() => setRange('today')}
          >
            Today
          </button>
          <button
            type="button"
            className={`admin-range-btn ${range === 'week' ? 'active' : ''}`}
            onClick={() => setRange('week')}
          >
            This Week
          </button>
          <button
            type="button"
            className={`admin-range-btn ${range === 'month' ? 'active' : ''}`}
            onClick={() => setRange('month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`admin-range-btn ${range === 'custom' ? 'active' : ''}`}
            onClick={() => setRange('custom')}
          >
            Custom Range
          </button>
        </div>

        {range === 'custom' && (
          <form onSubmit={handleCustomDateSubmit} className="admin-custom-dates">
            <label htmlFor="custom-start">From:</label>
            <input
              id="custom-start"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              required
            />
            <label htmlFor="custom-end">To:</label>
            <input
              id="custom-end"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              required
            />
            <button type="submit" className="admin-action-btn-sm" style={{ padding: '7px 12px' }}>
              Apply
            </button>
          </form>
        )}
      </div>

      {/* 8 KPI Summary Cards */}
      <div className="admin-kpi-grid">
        {/* Total Orders */}
        <div className="kpi-card">
          <div className="kpi-icon blue">🧾</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Orders</span>
            <div className="kpi-value">{summary.totalOrders || 0}</div>
            <span className="kpi-subtext">
              {orders.today || 0} today • {orders.thisWeek || 0} this week
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="kpi-card">
          <div className="kpi-icon amber">⏳</div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Orders</span>
            <div className="kpi-value" style={{ color: '#d97706' }}>
              {summary.pendingOrders || 0}
            </div>
            <span className="kpi-subtext">Needs kitchen preparation</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="kpi-card">
          <div className="kpi-icon emerald">✅</div>
          <div className="kpi-content">
            <span className="kpi-label">Completed Orders</span>
            <div className="kpi-value" style={{ color: '#059669' }}>
              {summary.completedOrders || 0}
            </div>
            <span className="kpi-subtext">{summary.cancelledOrders || 0} cancelled</span>
          </div>
        </div>

        {/* Sales / Order Total in Period */}
        <div className="kpi-card">
          <div className="kpi-icon emerald">💰</div>
          <div className="kpi-content">
            <span className="kpi-label">Period Sales Total</span>
            <div className="kpi-value text-emerald">
              ${Number(sales.periodTotal || 0).toFixed(2)} USD
            </div>
            <span className="kpi-subtext">
              Today: ${Number(sales.today || 0).toFixed(2)} • Month: ${Number(sales.thisMonth || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="kpi-card">
          <div className="kpi-icon purple">📅</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Bookings</span>
            <div className="kpi-value">{summary.totalBookings || 0}</div>
            <span className="kpi-subtext">{bookings.today || 0} reservations today</span>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="kpi-card">
          <div className="kpi-icon amber">📋</div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Bookings</span>
            <div className="kpi-value" style={{ color: '#d97706' }}>
              {summary.pendingBookings || 0}
            </div>
            <span className="kpi-subtext">Awaiting confirmation</span>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="kpi-card">
          <div className="kpi-icon emerald">🤝</div>
          <div className="kpi-content">
            <span className="kpi-label">Confirmed Bookings</span>
            <div className="kpi-value" style={{ color: '#059669' }}>
              {summary.confirmedBookings || 0}
            </div>
            <span className="kpi-subtext">{bookings.upcoming || 0} upcoming</span>
          </div>
        </div>

        {/* Menu Items Stock */}
        <div className="kpi-card">
          <div className="kpi-icon rose">🍽️</div>
          <div className="kpi-content">
            <span className="kpi-label">Menu Items</span>
            <div className="kpi-value">{summary.availableMenuItems || 0}</div>
            <span className="kpi-subtext">
              {summary.unavailableMenuItems || 0} sold out of {summary.totalMenuItems || 0} total
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Popular Items Dual Grid */}
      <div className="admin-analytics-grid">
        {/* Sales & Orders Trend (Pure SVG Responsive Chart) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>📈 Sales & Order Volume Trend</h3>
              <small className="text-muted">
                Daily sales totals and volume for current filter ({range})
              </small>
            </div>
            <span className="chart-badge">{timeline.length} Days Recorded</span>
          </div>

          {timeline.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '36px 12px' }}>
              <span>📊</span>
              <p>No sales or order records found for this timeframe.</p>
            </div>
          ) : (
            <div className="admin-svg-chart-wrapper">
              <svg viewBox="0 0 500 200" className="admin-svg-chart" preserveAspectRatio="none">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="90" x2="480" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="150" x2="480" y2="150" stroke="#f3f4f6" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="35" y="34" fontSize="10" fill="#9ca3af" textAnchor="end">
                  ${Math.round(maxSales)}
                </text>
                <text x="35" y="94" fontSize="10" fill="#9ca3af" textAnchor="end">
                  ${Math.round(maxSales / 2)}
                </text>
                <text x="35" y="154" fontSize="10" fill="#9ca3af" textAnchor="end">
                  $0
                </text>

                {/* Bars & Labels */}
                {timeline.map((item, idx) => {
                  const barWidth = Math.min(32, Math.max(12, 400 / timeline.length - 8));
                  const step = (440 - barWidth) / (timeline.length > 1 ? timeline.length - 1 : 1);
                  const x = timeline.length === 1 ? 240 : 45 + idx * step;
                  const barHeight = (item.sales / maxSales) * 120;
                  const y = 150 - barHeight;

                  return (
                    <g key={item.date}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, 4)}
                        fill="#f59e0b"
                        rx="3"
                        opacity="0.9"
                      >
                        <title>{`${item.date}: $${item.sales} (${item.orders} orders)`}</title>
                      </rect>
                      <text
                        x={x + barWidth / 2}
                        y="170"
                        fontSize="9"
                        fill="#6b7280"
                        textAnchor="middle"
                      >
                        {item.date.slice(5)}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(y - 5, 20)}
                        fontSize="9"
                        fill="#b45309"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ${Math.round(item.sales)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Popular Menu Items */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>🔥 Popular Menu Items</h3>
              <small className="text-muted">Calculated from actual order line item counts</small>
            </div>
          </div>

          {popularItems.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '36px 12px' }}>
              <span>🍽️</span>
              <p>No orders placed in this period yet.</p>
            </div>
          ) : (
            <div className="popular-items-list">
              {popularItems.map((item, index) => {
                const percentage = Math.round((item.quantity / maxPopularQty) * 100);
                return (
                  <div key={item.name} className="popular-item-row">
                    <div className="popular-item-info">
                      <span className="popular-item-name">
                        <span className="popular-item-rank">#{index + 1}</span>
                        {item.name}
                      </span>
                      <span className="popular-item-qty">{item.quantity} ordered</span>
                    </div>
                    <div className="popular-bar-bg">
                      <div className="popular-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Sections Grid */}
      <div className="admin-recent-grid">
        {/* Recent Orders Table */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="panel-action-link">
              View All Orders →
            </Link>
          </div>

          {!recentOrders || recentOrders.length === 0 ? (
            <div className="admin-empty-state">
              <span>🧾</span>
              <p>No orders found in database.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-mono font-bold text-amber">{order.orderNumber}</td>
                      <td>{order.customer?.name}</td>
                      <td>{order.customer?.phone}</td>
                      <td className="font-bold text-emerald">
                        ${Number(order.total).toFixed(2)} USD
                      </td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Bookings Table */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <h3>📅 Upcoming Bookings</h3>
            <Link to="/admin/bookings?dateFilter=upcoming" className="panel-action-link">
              View All Bookings →
            </Link>
          </div>

          {!upcomingBookings || upcomingBookings.length === 0 ? (
            <div className="admin-empty-state">
              <span>📅</span>
              <p>No upcoming reservations scheduled.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking No</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Date & Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="font-mono font-bold text-amber">{b.bookingNumber}</td>
                      <td>
                        <strong>{b.customerName}</strong>
                      </td>
                      <td>{b.phone}</td>
                      <td>
                        {b.date} at {b.time}
                      </td>
                      <td>
                        <strong>{b.numberOfGuests}</strong> guests
                      </td>
                      <td>
                        <span className={`status-pill status-${b.status}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

