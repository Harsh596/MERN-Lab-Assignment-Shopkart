import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist, toggleWishlist } from '../services/wishlistService';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addToCart, itemLoading, isItemInCart, getItemQuantity } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isSaving, setIsSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;
  const isAdding = !!itemLoading?.[_id];
  const inCart = isItemInCart ? isItemInCart(_id) : false;
  const cartQty = getItemQuantity ? getItemQuantity(_id) : 0;

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setCartError(null);
    setCartSuccess(false);

    const res = await addToCart(_id);
    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    } else {
      setCartError(res.message || 'Could not add to cart');
      setTimeout(() => setCartError(null), 3000);
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    setIsSaving(true);
    setWishlistError(null);

    try {
      if (isWishlisted) {
        await removeFromWishlist(_id);
        setIsWishlisted(false);
        if (onWishlistChange) onWishlistChange(_id, false);
      } else {
        await addToWishlist(_id);
        setIsWishlisted(true);
        if (onWishlistChange) onWishlistChange(_id, true);
      }
    } catch (err) {
      console.error('Wishlist action error:', err);
      // If server returned 409 Conflict, it means the item is already in wishlist
      if (err.response?.status === 409) {
        setIsWishlisted(true);
      } else {
        setWishlistError(
          err.response?.data?.message || 'Unable to save product. Please try again.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Format price into Indian Numbering System with commas (e.g. ₹2,999)
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  // Determine stock badge styling and label
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleCardClick = () => {
    navigate(`/products/${_id}`);
  };

  // Safe SVG placeholder in case image URL fails to load
  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="%23f1f5f9" width="300" height="300"/><text fill="%2394a3b8" font-family="sans-serif" font-size="16" dy="10.5" font-weight="600" x="50%" y="50%" text-anchor="middle">No Image Available</text></svg>';

  return (
    <article
      id={`product-card-${_id}`}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 16px 32px -8px rgba(79, 70, 229, 0.18), 0 4px 12px rgba(0, 0, 0, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        borderColor: isHovered ? '#c7d2fe' : '#e2e8f0',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Pill Tag and Floating Heart */}
      <div style={styles.topBadgeRow}>
        <div style={styles.badgeLeftGroup}>
          <span style={styles.categoryPill}>{category || 'General'}</span>
          {isOutOfStock ? (
            <span style={styles.outOfStockPill}>Out of Stock</span>
          ) : isLowStock ? (
            <span style={styles.lowStockPill}>Only {stock} left!</span>
          ) : (
            <span style={styles.inStockPill}>{stock} units left</span>
          )}
        </div>

        {/* Floating Heart Icon Button */}
        <button
          id={`wishlist-heart-btn-${_id}`}
          onClick={handleWishlistClick}
          disabled={isSaving}
          style={{
            ...styles.floatingHeartBtn,
            color: isWishlisted ? '#e11d48' : '#64748b',
            backgroundColor: isWishlisted ? '#fff1f2' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isWishlisted ? '#fda4af' : '#e2e8f0',
            opacity: isSaving ? 0.7 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isSaving ? '⏳' : isWishlisted ? '♥' : '♡'}
        </button>
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

        {/* Feedback notices */}
        {wishlistError && (
          <div style={styles.errorNotice} role="alert">
            ⚠️ {wishlistError}
          </div>
        )}
        {cartError && (
          <div style={styles.errorNotice} role="alert">
            ⚠️ {cartError}
          </div>
        )}
        {cartSuccess && (
          <div style={styles.successNotice} role="status">
            ✓ Added to cart!
          </div>
        )}

        {/* Dual Actions: Add to Cart (Task 7) and View Details */}
        <div style={styles.actionRow}>
          <button
            id={`add-to-cart-btn-${_id}`}
            onClick={handleAddToCartClick}
            disabled={isOutOfStock || isAdding || (inCart && cartQty >= stock)}
            style={{
              ...styles.cartBtn,
              backgroundColor: isOutOfStock
                ? '#94a3b8'
                : inCart
                ? '#059669'
                : '#4f46e5',
              opacity: isAdding || (inCart && cartQty >= stock) ? 0.75 : 1,
              cursor:
                isOutOfStock || isAdding || (inCart && cartQty >= stock)
                  ? 'not-allowed'
                  : 'pointer',
            }}
            aria-label={`Add ${name} to cart`}
          >
            {isAdding
              ? 'Adding...'
              : isOutOfStock
              ? 'Out of Stock'
              : inCart
              ? cartQty >= stock
                ? 'Max in Cart'
                : '+ Add Another'
              : 'Add to Cart'}
          </button>

          <button
            id={`view-details-${_id}`}
            onClick={handleCardClick}
            style={styles.detailsBtn}
            aria-label={`View details for ${name}`}
          >
            Details →
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
  badgeLeftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  floatingHeartBtn: {
    pointerEvents: 'auto',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(8px)',
    color: '#4338ca',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    border: '1px solid rgba(199, 210, 254, 0.6)',
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
    height: '220px',
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
  errorNotice: {
    backgroundColor: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: 1.3,
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
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#334155',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  cartBtn: {
    padding: '9px 12px',
    borderRadius: '10px',
    border: 'none',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
  },
  successNotice: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: 1.3,
  },
  wishlistBtn: {
    padding: '9px 10px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
};
