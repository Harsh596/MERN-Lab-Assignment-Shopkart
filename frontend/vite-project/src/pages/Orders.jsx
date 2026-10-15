import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyOrders, updateOrderStatus } from '../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Unable to retrieve orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Bonus Challenge (+10 Marks): Interactive status progression
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        setActionNotice(`Order status advanced to ${newStatus}!`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'SHIPPED':
        return { bg: '#f3e8ff', text: '#7e22ce' };
      case 'CONFIRMED':
        return { bg: '#e0e7ff', text: '#4338ca' };
      case 'PLACED':
        return { bg: '#dbeafe', text: '#1d4ed8' };
      default:
        return { bg: '#fef3c7', text: '#b45309' };
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle} id="my-orders-heading">
              My Orders
            </h1>
            <p style={styles.subtitle}>Track your purchase history and order fulfillment status.</p>
          </div>
          <Link to="/products" style={styles.shopMoreBtn}>
            🛍️ Browse More Products
          </Link>
        </div>

        {actionNotice && (
          <div style={styles.toastNotice} role="status">
            ✓ {actionNotice}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div style={styles.centerBox} id="orders-loading-state">
            <div style={styles.spinner}></div>
            <h2 style={styles.stateHeading}>Loading your orders...</h2>
            <p style={styles.stateSubtitle}>Retrieving your order history from the database</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div style={styles.centerBox} id="orders-error-state">
            <span style={styles.errorIcon}>⚠️</span>
            <h2 style={styles.stateHeading}>Unable to load your orders.</h2>
            <p style={styles.stateSubtitle}>{error}</p>
            <button onClick={fetchOrders} style={styles.retryBtn} id="orders-retry-btn">
              🔄 Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY STATE */
          <div style={styles.centerBox} id="orders-empty-state">
            <span style={styles.emptyIcon}>📦</span>
            <h2 style={styles.stateHeading}>You have not placed any orders yet.</h2>
            <p style={styles.stateSubtitle}>Explore our catalog and find something you love!</p>
            <Link to="/products" style={styles.primaryLink} id="orders-start-shopping-btn">
              ✨ Start Shopping
            </Link>
          </div>
        ) : (
          /* ORDERS LIST */
          <div style={styles.ordersList}>
            {orders.map((order) => {
              const statusStyle = getStatusBadgeStyle(order.status);
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const formattedTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(order.totalAmount);

              return (
                <div key={order._id} style={styles.orderCard} id={`order-card-${order._id}`}>
                  {/* Top Bar */}
                  <div style={styles.cardHeader}>
                    <div style={styles.orderMeta}>
                      <span style={styles.orderNumber}>Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span style={styles.orderDate}>{formattedDate}</span>
                    </div>

                    <div style={styles.badgesGroup}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {order.status}
                      </span>
                      <span
                        style={{
                          ...styles.paymentBadge,
                          backgroundColor: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2',
                          color: order.paymentStatus === 'PAID' ? '#166534' : '#991b1b',
                        }}
                      >
                        {order.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={styles.itemsSection}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <img
                          src={item.image || 'https://placehold.co/56x56'}
                          alt={item.name}
                          style={styles.itemImg}
                        />
                        <div style={styles.itemDetails}>
                          <span style={styles.itemName}>{item.name}</span>
                          <span style={styles.itemQtyPrice}>
                            ₹{item.price} × {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                        <span style={styles.itemLineTotal}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Delivery Info & Total */}
                  <div style={styles.cardFooter}>
                    <div style={styles.deliveryInfo}>
                      <span style={styles.deliveryLabel}>Delivering to:</span>
                      <span style={styles.deliveryText}>
                        {order.shippingAddress?.fullName}, {order.shippingAddress?.city},{' '}
                        {order.shippingAddress?.pincode}
                      </span>
                    </div>

                    <div style={styles.totalBlock}>
                      <span style={styles.totalLabel}>Total:</span>
                      <span style={styles.totalValue}>{formattedTotal}</span>
                    </div>
                  </div>

                  {/* Bonus Challenge: Order Progression Simulator */}
                  <div style={styles.bonusProgressionRow}>
                    <span style={styles.progressionLabel}>
                      <strong>Status Progression Simulator:</strong>
                    </span>
                    <div style={styles.progressionBtns}>
                      {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(order._id, st)}
                          disabled={order.status === st || statusUpdatingId === order._id}
                          style={{
                            ...styles.progressionBtn,
                            backgroundColor: order.status === st ? '#4f46e5' : '#f1f5f9',
                            color: order.status === st ? '#ffffff' : '#475569',
                            cursor: order.status === st ? 'default' : 'pointer',
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    maxWidth: '1000px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 64px',
    boxSizing: 'border-box',
    flex: 1,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    margin: '0 0 6px',
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  shopMoreBtn: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
    textDecoration: 'none',
  },
  toastNotice: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  orderNumber: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  orderDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  badgesGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  paymentBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  itemsSection: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  itemImg: {
    width: '54px',
    height: '54px',
    borderRadius: '10px',
    objectFit: 'cover',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemQtyPrice: {
    fontSize: '12px',
    color: '#64748b',
  },
  itemLineTotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardFooter: {
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  deliveryInfo: {
    fontSize: '13px',
    color: '#475569',
  },
  deliveryLabel: {
    fontWeight: '600',
    marginRight: '6px',
  },
  deliveryText: {
    color: '#64748b',
  },
  totalBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#4f46e5',
  },
  bonusProgressionRow: {
    padding: '12px 24px',
    backgroundColor: '#f8fafc',
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
  },
  progressionLabel: {
    fontSize: '12px',
    color: '#475569',
  },
  progressionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  progressionBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  centerBox: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '56px 24px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    maxWidth: '480px',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #e0e7ff',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '16px',
  },
  stateHeading: {
    margin: '0 0 6px',
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
  },
  stateSubtitle: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '52px',
    marginBottom: '16px',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  retryBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  primaryLink: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
  },
};
