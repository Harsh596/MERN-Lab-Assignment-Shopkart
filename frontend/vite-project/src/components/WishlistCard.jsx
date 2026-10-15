import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  // Format price into Indian Numbering System (e.g. ₹2,999)
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleCardClick = () => {
    navigate(`/products/${_id}`);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(_id);
    } finally {
      setIsRemoving(false);
    }
  };

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="%23f1f5f9" width="300" height="300"/><text fill="%2394a3b8" font-family="sans-serif" font-size="16" dy="10.5" font-weight="600" x="50%" y="50%" text-anchor="middle">No Image</text></svg>';

  return (
    <article
      id={`wishlist-card-${_id}`}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 16px 32px -8px rgba(225, 29, 72, 0.18), 0 4px 12px rgba(0, 0, 0, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        borderColor: isHovered ? '#fecdd3' : '#e2e8f0',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Pill Tag & Stock Badge */}
      <div style={styles.topBadgeRow}>
        <span style={styles.categoryPill}>{category || 'General'}</span>
        {isOutOfStock ? (
          <span style={styles.outOfStockPill}>Out of Stock</span>
        ) : isLowStock ? (
          <span style={styles.lowStockPill}>Only {stock} left!</span>
        ) : (
          <span style={styles.inStockPill}>{stock} in stock</span>
        )}
      </div>

      {/* Image Container with Fixed Aspect Ratio */}
      <div style={styles.imageWrapper} onClick={handleCardClick}>
        <img
          src={imageError ? fallbackImage : image}
          alt={name}
          loading="lazy"
          onError={() => setImageError(true)}
          style={{
            ...styles.image,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      </div>

      {/* Product Content Information */}
      <div style={styles.body}>
        <h3 style={styles.title} title={name} onClick={handleCardClick}>
          {name}
        </h3>

        <div style={styles.priceRow}>
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Price</span>
            <span style={styles.priceValue}>{formattedPrice}</span>
          </div>
        </div>

        {/* Dual Actions: View Details and Remove from Wishlist */}
        <div style={styles.actionRow}>
          <button
            id={`view-details-${_id}`}
            onClick={handleCardClick}
            style={{
              ...styles.detailsBtn,
              backgroundColor: isHovered ? '#4338ca' : '#4f46e5',
            }}
            aria-label={`View details for ${name}`}
          >
            View Details
          </button>

          <button
            id={`remove-wishlist-${_id}`}
            onClick={handleRemove}
            disabled={isRemoving}
            style={{
              ...styles.removeBtn,
              opacity: isRemoving ? 0.6 : 1,
              cursor: isRemoving ? 'not-allowed' : 'pointer',
            }}
            aria-label={`Remove ${name} from wishlist`}
          >
            {isRemoving ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    position: 'relative',
  },
  topBadgeRow: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    right: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    pointerEvents: 'none',
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(8px)',
    color: '#e11d48',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    border: '1px solid rgba(254, 205, 211, 0.8)',
  },
  inStockPill: {
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    backdropFilter: 'blur(6px)',
    color: '#166534',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
  },
  lowStockPill: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    backdropFilter: 'blur(6px)',
    color: '#b91c1c',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  outOfStockPill: {
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
    backdropFilter: 'blur(6px)',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },
  imageWrapper: {
    height: '210px',
    width: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    cursor: 'pointer',
    overflow: 'hidden',
    borderBottom: '1px solid #f1f5f9',
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  body: {
    padding: '16px 18px 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    lineHeight: 1.4,
    height: '42px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #f8fafc',
  },
  detailsBtn: {
    padding: '9px 12px',
    borderRadius: '10px',
    border: 'none',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  removeBtn: {
    padding: '9px 10px',
    borderRadius: '10px',
    border: '1px solid #fecdd3',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    cursor: 'pointer',
  },
};
