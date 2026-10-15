import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlist } from '../services/wishlistService';

export default function Navbar() {
  const { user: customer, logout } = useAuth();
  const { totalUnits } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadWishlistCount = async () => {
      try {
        const data = await getWishlist();
        if (isMounted && data.success) {
          setWishlistCount(data.count ?? data.wishlist?.length ?? 0);
        }
      } catch (err) {
        // Silently handle if unauthenticated or error
      }
    };

    if (customer) {
      loadWishlistCount();
    }

    return () => {
      isMounted = false;
    };
  }, [customer, location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const isHomeActive = location.pathname === '/home';
  const isProductsActive = location.pathname.startsWith('/products');
  const isWishlistActive = location.pathname === '/wishlist';
  const isCartActive = location.pathname === '/cart';
  const isOrdersActive = location.pathname.startsWith('/orders');

  return (
    <header style={navStyles.header}>
      <div style={navStyles.container}>
        {/* Brand Identity */}
        <div style={navStyles.brandGroup}>
          <Link to="/home" style={navStyles.brand}>
            <span style={navStyles.logoIcon}>🛍️</span>
            <span style={navStyles.brandName}>ShopKart</span>
          </Link>

          {/* Navigation Links */}
          <nav style={navStyles.navLinks} aria-label="Main Navigation">
            <Link
              to="/home"
              id="nav-home-link"
              style={{
                ...navStyles.navLink,
                ...(isHomeActive ? navStyles.navLinkActive : {}),
              }}
            >
              Home
            </Link>
            <Link
              to="/products"
              id="nav-products-link"
              style={{
                ...navStyles.navLink,
                ...(isProductsActive ? navStyles.navLinkActive : {}),
              }}
            >
              Products Catalog
            </Link>
            <Link
              to="/wishlist"
              id="nav-wishlist-link"
              style={{
                ...navStyles.navLink,
                ...(isWishlistActive ? navStyles.navLinkActiveWishlist : {}),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Wishlist</span>
              {wishlistCount > 0 ? (
                <span style={navStyles.wishlistBadge}>
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/cart"
              id="nav-cart-link"
              style={{
                ...navStyles.navLink,
                ...(isCartActive ? navStyles.navLinkActiveCart : {}),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Cart ({totalUnits})</span>
              {totalUnits > 0 && (
                <span style={navStyles.cartBadge}>
                  {totalUnits}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              id="nav-orders-link"
              style={{
                ...navStyles.navLink,
                ...(isOrdersActive ? navStyles.navLinkActive : {}),
              }}
            >
              My Orders
            </Link>
          </nav>
        </div>

        {/* User Identity & Logout Controls */}
        <div style={navStyles.navRight}>
          {customer && (
            <div style={navStyles.userInfo}>
              <div style={navStyles.avatar}>
                {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={navStyles.userDetails}>
                <span style={navStyles.userName}>{customer.fullName}</span>
                <span style={navStyles.userEmail}>{customer.email}</span>
              </div>
            </div>
          )}

          <button
            id="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              ...navStyles.logoutBtn,
              opacity: loggingOut ? 0.7 : 1,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
            }}
            title="Log out of ShopKart"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

const navStyles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    gap: '20px',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#111827',
  },
  logoIcon: {
    fontSize: '24px',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#111827',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    padding: '8px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  navLinkActiveWishlist: {
    color: '#e11d48',
    backgroundColor: '#fff1f2',
  },
  navLinkActiveCart: {
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  wishlistBadge: {
    backgroundColor: '#e11d48',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '12px',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '12px',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #c7d2fe',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 1.2,
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.2,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};
