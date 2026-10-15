import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../services/orderService';

/**
 * Helper to dynamically load the Razorpay standard checkout script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalUnits, subtotal, clearCart, loading: cartLoading } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If cart is empty and not loading, redirect to /cart
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const phoneClean = formData.phone.trim();
    if (!phoneClean) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(phoneClean)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    const pincodeClean = formData.pincode.trim();
    if (!pincodeClean) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(pincodeClean)) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Client-side Form Validation
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Ensure Razorpay SDK script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay checkout SDK. Please check your internet connection.');
      }

      // 3. Request backend to validate stock, create ShopKart order, and generate Razorpay order
      const paymentOrderData = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      if (!paymentOrderData.success) {
        throw new Error(paymentOrderData.message || 'Failed to initialize order on server');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = paymentOrderData;

      // 4. Configure Razorpay Standard Checkout Options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'ShopKart',
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        // Handled when user successfully completes test payment in popup
        handler: async function (response) {
          try {
            setIsProcessing(true);
            // 5. Send signatures to backend for HMAC verification
            const verifyRes = await verifyPayment({
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // Task 5: Clear global cart state and navbar count
              clearCart();
              // Navigate to order confirmation
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setErrorMessage(verifyRes.message || 'Payment signature verification failed.');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setErrorMessage(err.response?.data?.message || 'Payment verification failed. Your cart was preserved.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment failure event
      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setIsProcessing(false);
        setErrorMessage(
          response.error?.description || 'Payment was unsuccessful. Your cart has been preserved. Please try again.'
        );
      });

      // Open Razorpay Modal
      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.response?.data?.message || err.message || 'An error occurred during checkout. Please try again.'
      );
    }
  };

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.breadcrumbRow}>
          <Link to="/cart" style={styles.backLink}>
            ← Back to Cart
          </Link>
        </div>

        <h1 style={styles.pageTitle} id="checkout-title">
          Checkout & Shipping
        </h1>
        <p style={styles.subtitle}>Complete your delivery address and pay securely with Razorpay Test Mode.</p>

        {errorMessage && (
          <div style={styles.errorAlert} role="alert" id="checkout-error-alert">
            <span style={styles.errorIcon}>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={styles.layoutGrid}>
          {/* Left Column: Shipping Address Form */}
          <div style={styles.formCard}>
            <h2 style={styles.sectionHeading}>📦 Shipping Details</h2>

            <form onSubmit={handlePlaceOrder} id="shipping-form" noValidate>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="fullName">
                  Full Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  style={{
                    ...styles.input,
                    borderColor: errors.fullName ? '#ef4444' : '#cbd5e1',
                  }}
                  disabled={isProcessing}
                />
                {errors.fullName && <span style={styles.fieldError}>{errors.fullName}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="phone">
                  Phone Number <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  style={{
                    ...styles.input,
                    borderColor: errors.phone ? '#ef4444' : '#cbd5e1',
                  }}
                  disabled={isProcessing}
                />
                {errors.phone && <span style={styles.fieldError}>{errors.phone}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="addressLine1">
                  Street Address / Flat No. <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                  style={{
                    ...styles.input,
                    borderColor: errors.addressLine1 ? '#ef4444' : '#cbd5e1',
                  }}
                  disabled={isProcessing}
                />
                {errors.addressLine1 && <span style={styles.fieldError}>{errors.addressLine1}</span>}
              </div>

              <div style={styles.twoColRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="city">
                    City <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    style={{
                      ...styles.input,
                      borderColor: errors.city ? '#ef4444' : '#cbd5e1',
                    }}
                    disabled={isProcessing}
                  />
                  {errors.city && <span style={styles.fieldError}>{errors.city}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="state">
                    State <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    style={{
                      ...styles.input,
                      borderColor: errors.state ? '#ef4444' : '#cbd5e1',
                    }}
                    disabled={isProcessing}
                  />
                  {errors.state && <span style={styles.fieldError}>{errors.state}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="pincode">
                  6-Digit Pincode <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  style={{
                    ...styles.input,
                    borderColor: errors.pincode ? '#ef4444' : '#cbd5e1',
                  }}
                  disabled={isProcessing}
                />
                {errors.pincode && <span style={styles.fieldError}>{errors.pincode}</span>}
              </div>

              <div style={styles.paymentNoticeBox}>
                <span style={styles.testBadge}>TEST MODE</span>
                <p style={styles.testModeText}>
                  Razorpay is configured in <strong>Test Mode</strong>. No actual money will be charged.
                  You can use Razorpay's test cards or NetBanking simulator to complete the purchase.
                </p>
              </div>

              <button
                type="submit"
                id="place-order-submit-btn"
                disabled={isProcessing}
                style={{
                  ...styles.submitBtn,
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                {isProcessing ? '⏳ Processing Order...' : `💳 Pay ${formattedTotal} with Razorpay`}
              </button>
            </form>
          </div>

          {/* Right Column: Order Review Summary */}
          <div style={styles.summaryCol}>
            <div style={styles.summaryCard} id="checkout-order-summary">
              <h2 style={styles.sectionHeading}>🧾 Order Review</h2>

              <div style={styles.itemsList}>
                {cartItems.map((item) => {
                  const p = item.product || {};
                  const lineTotal = (Number(p.price) || 0) * (Number(item.quantity) || 1);
                  return (
                    <div key={p._id || item._id} style={styles.itemRow}>
                      <img
                        src={p.image || 'https://placehold.co/50x50'}
                        alt={p.name}
                        style={styles.itemThumb}
                      />
                      <div style={styles.itemMeta}>
                        <div style={styles.itemName}>{p.name}</div>
                        <div style={styles.itemQty}>
                          ₹{p.price} × {item.quantity}
                        </div>
                      </div>
                      <div style={styles.itemTotal}>₹{lineTotal.toLocaleString('en-IN')}</div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.divider}></div>

              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Total Items:</span>
                <span style={styles.calcValue}>{totalUnits} units</span>
              </div>

              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Subtotal:</span>
                <span style={styles.calcValue}>{formattedTotal}</span>
              </div>

              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Standard Delivery:</span>
                <span style={styles.freeBadge}>FREE</span>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Payable:</span>
                <span style={styles.totalAmount}>{formattedTotal}</span>
              </div>

              <div style={styles.secureBadge}>
                <span>🔒</span>
                <span>End-to-End Encrypted Signature Verification</span>
              </div>
            </div>
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
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 64px',
    boxSizing: 'border-box',
    flex: 1,
  },
  breadcrumbRow: {
    marginBottom: '16px',
  },
  backLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6366f1',
    textDecoration: 'none',
  },
  pageTitle: {
    margin: '0 0 6px',
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: '14px',
    color: '#64748b',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '32px',
    alignItems: 'start',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  summaryCol: {
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
  sectionHeading: {
    margin: '0 0 20px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  twoColRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  fieldError: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
    fontWeight: '500',
  },
  paymentNoticeBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '14px',
    margin: '20px 0',
  },
  testBadge: {
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  testModeText: {
    margin: '8px 0 0',
    fontSize: '12px',
    color: '#1e40af',
    lineHeight: 1.4,
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
    transition: 'all 0.15s ease',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '280px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    objectFit: 'cover',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  itemMeta: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemQty: {
    fontSize: '12px',
    color: '#64748b',
  },
  itemTotal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '16px 0',
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '13px',
  },
  calcLabel: {
    color: '#64748b',
  },
  calcValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  freeBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '14px',
  },
  totalLabel: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  totalAmount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#4f46e5',
  },
  secureBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#64748b',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
  },
};
