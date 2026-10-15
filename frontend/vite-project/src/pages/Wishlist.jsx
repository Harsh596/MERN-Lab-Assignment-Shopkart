/**
 * ======================================================================================
 * Wishlist Page — ShopKart Saved Products Experience (/wishlist)
 * ======================================================================================
 * 
 * WHAT THIS FILE DOES:
 * --------------------
 * Fulfills Lab 04 Tasks 6, 7 & 8:
 * 1. Fetches current authenticated user's wishlist from backend `GET /wishlist`.
 * 2. Implements all 3 mandatory UI lifecycle states:
 *    - Loading State: Intentional animated spinner and message while fetching.
 *    - Empty State: Informative banner with "Browse Products" CTA when 0 items exist.
 *    - Error State: Error card with a "Try Again" retry action if the network or server fails.
 * 3. Dynamically renders saved products via `.map()` using `<WishlistCard />`.
 * 4. Enables inline item removal calling backend `DELETE /wishlist/:productId` with
 *    immediate local state updates (no full page reload).
 * 
 * VIVA QUESTIONS & IN-DEPTH ANSWERS:
 * -----------------------------------
 * Q1: Why should the Wishlist page fetch data from the backend instead of keeping it in memory?
 * A1: Persistent backend storage in MongoDB ensures that user wishlist items survive browser
 *     refreshes, logout/login cycles, and are synchronized across multiple devices or browser tabs.
 * 
 * Q2: Why is client-side state management (like Redux or Context) NOT required for Wishlist?
 * A2: The wishlist is an authoritative database relationship owned by the User document.
 *     Fetching it directly on page mount guarantees the user always sees fresh, up-to-date data
 *     directly from the MongoDB database without caching bugs or stale frontend states.
 * ======================================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';

export default function Wishlist() {
  const navigate = useNavigate();

  // State for saved products list
  const [wishlistItems, setWishlistItems] = useState([]);

  // Three Crucial UI States: Loading, Error, Empty
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Fetch Wishlist from backend GET /wishlist
  const fetchWishlist = useCallback(async () => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getWishlist();
      if (isMounted) {
        if (data.success) {
          setWishlistItems(data.wishlist || []);
        } else {
          setErrorMessage(data.message || "We couldn't load your wishlist.");
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error fetching wishlist:', err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong. We couldn't load your wishlist."
        );
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Handle item removal from Wishlist (Task 4 & 6)
  const handleRemoveItem = async (productId) => {
    try {
      const res = await removeFromWishlist(productId);
      if (res.success) {
        // Optimistically update list without reloading the page
        setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
        setFeedbackToast('Product removed from your wishlist.');
        setTimeout(() => setFeedbackToast(null), 3000);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert(err.response?.data?.message || 'Failed to remove product. Please try again.');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.mainContainer}>
        {/* Header Section */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.badgeRow}>
              <span style={styles.headerBadge}>❤️ Saved Items</span>
            </div>
            <h1 style={styles.heading}>My Wishlist</h1>
            <p style={styles.subheading}>
              {!isLoading && !errorMessage
                ? `${wishlistItems.length} product${wishlistItems.length === 1 ? '' : 's'} saved`
                : 'Manage your saved products and come back when you are ready to purchase.'}
            </p>
          </div>

          <button
            id="continue-shopping-btn"
            onClick={() => navigate('/products')}
            style={styles.browseCatalogBtn}
          >
            ← Continue Shopping
          </button>
        </header>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div id="wishlist-toast-banner" style={styles.toastBanner}>
            ℹ️ {feedbackToast}
          </div>
        )}

        {/* Dynamic Presentation Area: Loading, Error, Empty, or Populated Grid */}
        <section style={styles.contentSection} aria-live="polite">
          {/* 1. LOADING STATE (Task 7 & Section 10) */}
          {isLoading && (
            <div id="wishlist-loading-state" style={styles.stateCard}>
              <div style={styles.spinner}></div>
              <h3 style={styles.stateTitle}>Loading your wishlist...</h3>
              <p style={styles.stateDesc}>Fetching your saved items from MongoDB.</p>
            </div>
          )}

          {/* 2. ERROR STATE (Task 7 & Section 11) */}
          {!isLoading && errorMessage && (
            <div id="wishlist-error-state" style={styles.errorCard}>
              <div style={styles.errorIcon}>⚠️</div>
              <h3 style={styles.errorTitle}>Something went wrong.</h3>
              <p style={styles.errorDesc}>{errorMessage}</p>
              <button id="retry-wishlist-btn" onClick={fetchWishlist} style={styles.retryBtn}>
                🔄 Try Again
              </button>
            </div>
          )}

          {/* 3. EMPTY STATE (Task 7 & Section 9) */}
          {!isLoading && !errorMessage && wishlistItems.length === 0 && (
            <div id="wishlist-empty-state" style={styles.emptyCard}>
              <div style={styles.emptyHeartIcon}>❤️</div>
              <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
              <p style={styles.emptyDesc}>
                Save products you love and find them here later.
              </p>
              <button
                id="browse-products-empty-btn"
                onClick={() => navigate('/products')}
                style={styles.emptyActionBtn}
              >
                🛍️ Browse Products
              </button>
            </div>
          )}

          {/* 4. POPULATED WISHLIST GRID (Task 6 & Section 6) */}
          {!isLoading && !errorMessage && wishlistItems.length > 0 && (
            <div id="wishlist-grid" style={styles.grid}>
              {wishlistItems.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  mainContainer: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 80px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  badgeRow: {
    marginBottom: '8px',
  },
  headerBadge: {
    display: 'inline-block',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid #fecdd3',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.5,
  },
  browseCatalogBtn: {
    padding: '10px 18px',
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toastBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '12px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'fadeIn 0.3s ease',
  },
  contentSection: {
    marginTop: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '64px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
  },
  spinner: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '4px solid #e2e8f0',
    borderTopColor: '#e11d48',
    animation: 'spin 0.9s linear infinite',
    marginBottom: '18px',
  },
  stateTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  stateDesc: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '420px',
    margin: 0,
    lineHeight: 1.5,
  },
  errorCard: {
    backgroundColor: '#fff5f5',
    borderRadius: '16px',
    border: '1px solid #fecaca',
    padding: '60px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: '44px',
    marginBottom: '12px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  errorDesc: {
    fontSize: '14px',
    color: '#7f1d1d',
    maxWidth: '480px',
    margin: '0 0 20px 0',
  },
  retryBtn: {
    padding: '10px 22px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '80px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
  },
  emptyHeartIcon: {
    fontSize: '60px',
    marginBottom: '16px',
    animation: 'pulse 1.5s infinite',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: '#64748b',
    maxWidth: '380px',
    margin: '0 0 24px 0',
    lineHeight: 1.6,
  },
  emptyActionBtn: {
    padding: '12px 28px',
    backgroundColor: '#e11d48',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
  },
};
