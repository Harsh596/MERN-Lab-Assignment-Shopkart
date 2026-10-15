import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * CartItem Component
 * 
 * Displays an individual product row in the shopping cart.
 * Provides controls for incrementing/decrementing quantity with stock limits,
 * displaying item line subtotal, and an explicit removal button.
 */
export default function CartItem({ item, onUpdateQuantity, onRemove, isProcessing = false }) {
  const [imageError, setImageError] = useState(false);

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const { _id, name, price, image, stock, category } = product;

  const itemPrice = Number(price) || 0;
  const itemQuantity = Number(quantity) || 1;
  const lineTotal = itemPrice * itemQuantity;
  const maxStock = Number(stock) || 0;

  // Indian currency formatting
  const formattedUnitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(itemPrice);

  const formattedLineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(lineTotal);

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="%23f1f5f9" width="120" height="120"/><text fill="%2394a3b8" font-family="sans-serif" font-size="12" dy="4" font-weight="600" x="50%" y="50%" text-anchor="middle">No Image</text></svg>';

  const isAtMaxStock = itemQuantity >= maxStock;
  const isAtMinQuantity = itemQuantity <= 1;

  const handleDecrease = () => {
    if (isAtMinQuantity || isProcessing) return;
    onUpdateQuantity(_id, itemQuantity - 1);
  };

  const handleIncrease = () => {
    if (isAtMaxStock || isProcessing) return;
    onUpdateQuantity(_id, itemQuantity + 1);
  };

  const handleRemove = () => {
    if (isProcessing) return;
    onRemove(_id);
  };

  return (
    <div id={`cart-item-${_id}`} style={styles.card}>
      {/* Product Thumbnail */}
      <Link to={`/products/${_id}`} style={styles.imageLink} title={`View ${name}`}>
        <img
          src={imageError ? fallbackImage : image}
          alt={name}
          onError={() => setImageError(true)}
          style={styles.image}
        />
      </Link>

      {/* Main Info */}
      <div style={styles.detailsCol}>
        <div style={styles.topInfo}>
          {category && <span style={styles.categoryBadge}>{category}</span>}
          <Link to={`/products/${_id}`} style={styles.titleLink}>
            <h3 style={styles.productTitle}>{name}</h3>
          </Link>
          <div style={styles.unitPrice}>
            Unit Price: <span style={styles.unitPriceValue}>{formattedUnitPrice}</span>
          </div>
          {maxStock > 0 && maxStock <= 5 && (
            <span style={styles.lowStockWarning}>Only {maxStock} units left in stock!</span>
          )}
        </div>

        {/* Quantity Controls & Actions */}
        <div style={styles.controlsRow}>
          <div style={styles.qtyContainer}>
            <span style={styles.qtyLabel}>Quantity:</span>
            <div style={styles.qtyControlBox}>
              <button
                id={`decrease-qty-btn-${_id}`}
                onClick={handleDecrease}
                disabled={isAtMinQuantity || isProcessing}
                style={{
                  ...styles.qtyBtn,
                  opacity: isAtMinQuantity || isProcessing ? 0.45 : 1,
                  cursor: isAtMinQuantity || isProcessing ? 'not-allowed' : 'pointer',
                }}
                title={
                  isAtMinQuantity
                    ? 'Minimum quantity is 1 (use Remove to delete item)'
                    : 'Decrease quantity'
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span id={`cart-qty-${_id}`} style={styles.qtyDisplay}>
                {itemQuantity}
              </span>

              <button
                id={`increase-qty-btn-${_id}`}
                onClick={handleIncrease}
                disabled={isAtMaxStock || isProcessing}
                style={{
                  ...styles.qtyBtn,
                  opacity: isAtMaxStock || isProcessing ? 0.45 : 1,
                  cursor: isAtMaxStock || isProcessing ? 'not-allowed' : 'pointer',
                }}
                title={
                  isAtMaxStock ? `Stock limit of ${maxStock} reached` : 'Increase quantity'
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {isAtMaxStock && (
              <span style={styles.maxReachedNote}>Max stock reached ({maxStock})</span>
            )}
          </div>

          <button
            id={`remove-cart-btn-${_id}`}
            onClick={handleRemove}
            disabled={isProcessing}
            style={{
              ...styles.removeBtn,
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
            title="Remove item from cart"
          >
            {isProcessing ? 'Removing...' : '🗑️ Remove'}
          </button>
        </div>
      </div>

      {/* Line Subtotal */}
      <div style={styles.subtotalCol}>
        <span style={styles.subtotalLabel}>Total</span>
        <span style={styles.subtotalAmount}>{formattedLineTotal}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  imageLink: {
    display: 'block',
    width: '100px',
    height: '100px',
    flexShrink: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  detailsCol: {
    flex: '1 1 240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  topInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  productTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.3,
  },
  unitPrice: {
    fontSize: '13px',
    color: '#64748b',
  },
  unitPriceValue: {
    fontWeight: '600',
    color: '#334155',
  },
  lowStockWarning: {
    fontSize: '12px',
    color: '#d97706',
    fontWeight: '600',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  qtyLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  qtyControlBox: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: '34px',
    height: '34px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
  qtyDisplay: {
    minWidth: '38px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    padding: '0 6px',
  },
  maxReachedNote: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 10px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s ease',
  },
  subtotalCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: '110px',
    textAlign: 'right',
  },
  subtotalLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  subtotalAmount: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '2px',
  },
};
