import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

/**
 * Cart Page — ShopKart Shopping Cart Experience (/cart)
 * 
 * Demonstrates:
 * - Reactive global state via CartContext
 * - Dynamic subtotal and unit calculations
 * - Complete Loading, Empty, and Error states
 * - Inline quantity adjustments with stock limits
 * - Item removal with real-time feedback
 */
export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    itemLoading,
    error,
    totalUnits,
    subtotal,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();

  const [toastMessage, setToastMessage] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const result = await updateQuantity(productId, newQuantity);
    if (!result.success) {
      showToast({ type: 'error', text: result.message || 'Could not update quantity' });
    }
  };

  const handleRemove = async (productId) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      showToast({ type: 'info', text: 'Item removed from cart' });
    } else {
      showToast({ type: 'error', text: result.message || 'Could not remove item' });
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // Indian currency formatting for subtotal
  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              ...styles.toast,
              backgroundColor: toastMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: toastMessage.type === 'error' ? '#b91c1c' : '#15803d',
              borderColor: toastMessage.type === 'error' ? '#fecaca' : '#bbf7d0',
            }}
            role="alert"
          >
            <span>{toastMessage.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Checkout Modal / Banner for Lab 06 Preview */}
        {checkoutNotice && (
          <div style={styles.modalOverlay} onClick={() => setCheckoutNotice(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span style={styles.modalIcon}>🚀</span>
              <h3 style={styles.modalTitle}>Ready for Checkout!</h3>
              <p style={styles.modalBody}>
                Your order of <strong>{totalUnits} items</strong> totaling{' '}
                <strong>{formattedSubtotal}</strong> is validated and reserved.
                Full checkout flow with shipping address & payment integration will be unlocked in Lab-06!
              </p>
              <button
                id="close-checkout-modal"
                onClick={() => setCheckoutNotice(false)}
                style={styles.modalBtn}
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && cartItems.length === 0 ? (
          <div style={styles.centerCard} id="cart-loading-state">
            <div style={styles.spinner}></div>
            <h2 style={styles.stateHeading}>Loading your cart...</h2>
            <p style={styles.stateSubtitle}>Retrieving your saved items and latest prices</p>
          </div>
        ) : error && cartItems.length === 0 ? (
          /* ERROR STATE */
          <div style={styles.centerCard} id="cart-error-state">
            <span style={styles.stateIcon}>⚠️</span>
            <h2 style={styles.stateHeading}>Unable to load your cart.</h2>
            <p style={styles.stateSubtitle}>{error}</p>
            <button
              id="try-again-cart-btn"
              onClick={fetchCart}
              style={styles.primaryBtn}
            >
              🔄 Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* EMPTY STATE */
          <div style={styles.centerCard} id="cart-empty-state">
            <span style={styles.stateIcon}>🛒</span>
            <h2 style={styles.stateHeading}>Your cart is empty</h2>
            <p style={styles.stateSubtitle}>Looks like you haven't added anything yet.</p>
            <Link to="/products" style={styles.primaryLink} id="empty-browse-btn">
              🛍️ Browse Products
            </Link>
          </div>
        ) : (
          /* POPULATED CART EXPERIENCE */
          <div>
            <div style={styles.headerRow}>
              <div>
                <h1 style={styles.pageTitle} id="cart-page-title">Shopping Cart</h1>
                <p style={styles.itemCountText}>
                  {cartItems.length} unique {cartItems.length === 1 ? 'item' : 'items'} ({totalUnits} total units)
                </p>
              </div>
              <Link to="/products" style={styles.continueLink}>
                ← Continue Shopping
              </Link>
            </div>

            <div style={styles.layoutGrid}>
              {/* Left Column: Cart Items List */}
              <div style={styles.itemsColumn}>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product?._id || item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    isProcessing={!!itemLoading[item.product?._id]}
                  />
                ))}
              </div>

              {/* Right Column: Order Summary Card */}
              <div style={styles.summaryColumn}>
                <div style={styles.summaryCard} id="order-summary-card">
                  <h2 style={styles.summaryTitle}>Order Summary</h2>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Total Items:</span>
                    <span style={styles.summaryValue} id="summary-items-count">
                      {totalUnits} units
                    </span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Subtotal:</span>
                    <span style={styles.summaryValue} id="summary-subtotal">
                      {formattedSubtotal}
                    </span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Standard Delivery:</span>
                    <span style={styles.freeBadge}>FREE</span>
                  </div>

                  <div style={styles.divider}></div>

                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Estimated Total:</span>
                    <span style={styles.totalValue} id="summary-total-amount">
                      {formattedSubtotal}
                    </span>
                  </div>

                  <p style={styles.taxNote}>Includes all government GST and applicable duties</p>

                  <button
                    id="proceed-to-checkout-btn"
                    onClick={handleProceedToCheckout}
                    style={styles.checkoutBtn}
                  >
                    Proceed to Checkout →
                  </button>

                  <div style={styles.trustBadges}>
                    <div style={styles.trustItem}>
                      <span>🔒</span>
                      <span>100% Secure Checkout</span>
                    </div>
                    <div style={styles.trustItem}>
                      <span>📦</span>
                      <span>Verified Stock Reservation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    maxWidth: '1200px',
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
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  itemCountText: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  continueLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6366f1',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '32px',
    alignItems: 'start',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryColumn: {
    position: 'sticky',
    top: '90px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  summaryTitle: {
    margin: '0 0 20px',
    fontSize: '19px',
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  freeBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '18px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '8px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#4f46e5',
  },
  taxNote: {
    fontSize: '11px',
    color: '#94a3b8',
    marginBottom: '20px',
    marginTop: 0,
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
    transition: 'all 0.2s ease',
  },
  trustBadges: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#64748b',
  },
  centerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '64px 32px',
    textAlign: 'center',
    maxWidth: '520px',
    margin: '40px auto',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stateIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  stateHeading: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px',
  },
  stateSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 24px',
    maxWidth: '360px',
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  },
  primaryLink: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e7ff',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '20px',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1000,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  modalIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  modalTitle: {
    margin: '0 0 12px',
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
  },
  modalBody: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5,
    margin: '0 0 24px',
  },
  modalBtn: {
    padding: '12px 28px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
