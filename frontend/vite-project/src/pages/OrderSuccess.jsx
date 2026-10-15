import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/orderService';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (isMounted) {
          if (data.success && data.order) {
            setOrder(data.order);
          } else {
            setError('Could not retrieve order details.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load order confirmation.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formattedTotal = order?.totalAmount
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(order.totalAmount)
    : '—';

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.confirmationCard} id="order-success-card">
          <div style={styles.successIconBadge}>✓</div>

          <h1 style={styles.title} id="order-success-heading">
            Order Placed Successfully!
          </h1>
          <p style={styles.subtitle}>
            Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
          </p>

          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner}></div>
              <span>Fetching order details...</span>
            </div>
          ) : error ? (
            <div style={styles.errorBox}>
              <p>{error}</p>
              <Link to="/orders" style={styles.secondaryLink}>
                View My Orders
              </Link>
            </div>
          ) : order ? (
            <div style={styles.detailsContainer}>
              {/* Order Metadata Pills */}
              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Order ID</span>
                  <span style={styles.metaValue} id="order-id-display">
                    {order._id}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Order Status</span>
                  <span style={styles.statusPill} id="order-status-display">
                    {order.status}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Payment Status</span>
                  <span style={styles.paymentPill} id="payment-status-display">
                    {order.paymentStatus}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Total Paid</span>
                  <span style={styles.totalValue} id="order-total-display">
                    {formattedTotal}
                  </span>
                </div>
              </div>

              {/* Items Purchased Snapshot */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Purchased Items ({order.items?.length})</h3>
                <div style={styles.itemsList}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <img
                        src={item.image || 'https://placehold.co/60x60'}
                        alt={item.name}
                        style={styles.itemThumb}
                      />
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemPriceQty}>
                          ₹{item.price} × {item.quantity} units
                        </span>
                      </div>
                      <span style={styles.itemTotal}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {order.shippingAddress && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Delivery Destination</h3>
                  <div style={styles.addressBox}>
                    <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                    <br />
                    {order.shippingAddress.addressLine1}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Action CTAs */}
          <div style={styles.ctaRow}>
            <Link to="/orders" style={styles.primaryBtn} id="view-my-orders-btn">
              📦 View My Orders
            </Link>
            <Link to="/products" style={styles.secondaryBtn} id="continue-shopping-btn">
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
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
    maxWidth: '800px',
    width: '100%',
    margin: '40px auto 60px',
    padding: '0 24px',
    boxSizing: 'border-box',
    flex: 1,
  },
  confirmationCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px 32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
    textAlign: 'center',
  },
  successIconBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    fontSize: '32px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loadingBox: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e0e7ff',
    borderTop: '3px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  detailsContainer: {
    textAlign: 'left',
    marginTop: '24px',
  },
  metaRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    marginBottom: '28px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  metaValue: {
    fontSize: '13px',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#0f172a',
    wordBreak: 'break-all',
  },
  statusPill: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    padding: '2px 8px',
    borderRadius: '6px',
    width: 'fit-content',
  },
  paymentPill: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '6px',
    width: 'fit-content',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#4f46e5',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
  },
  itemThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemPriceQty: {
    fontSize: '12px',
    color: '#64748b',
  },
  itemTotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  addressBox: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.5,
  },
  ctaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '32px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  },
  secondaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  secondaryLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
};
