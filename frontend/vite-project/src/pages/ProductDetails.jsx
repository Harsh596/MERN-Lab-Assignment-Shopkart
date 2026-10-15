
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/productService';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/wishlistService';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, itemLoading, isItemInCart, getItemQuantity } = useCart();

  // Component Data & UI States
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cartToast, setCartToast] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Wishlist state for this product
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null);

  // Fetch product from backend GET /products/:id
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        if (isMounted) {
          if (data.success && data.product) {
            setProduct(data.product);
          } else {
            setErrorMessage(data.message || 'Product could not be loaded.');
          }
        }

        // Check if product is currently in wishlist
        try {
          const wlData = await getWishlist();
          if (isMounted && wlData.success && Array.isArray(wlData.wishlist)) {
            const exists = wlData.wishlist.some((item) => (item._id || item) === id);
            setIsWishlisted(exists);
          }
        } catch (e) {
          // Ignore wishlist check error on details view
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in ProductDetails.jsx:', err);
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              'Could not retrieve product details. The product may have been removed.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle Wishlist Toggle
  const handleToggleWishlist = async () => {
    if (isSavingWishlist) return;
    setIsSavingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        setIsWishlisted(false);
        setWishlistToast({ type: 'info', text: 'Product removed from your wishlist' });
      } else {
        await addToWishlist(id);
        setIsWishlisted(true);
        setWishlistToast({ type: 'success', text: 'Product added to your wishlist ❤️' });
      }
      setTimeout(() => setWishlistToast(null), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistToast({ type: 'info', text: 'Product already in your wishlist' });
      } else {
        setWishlistToast({
          type: 'error',
          text: err.response?.data?.message || 'Unable to update wishlist. Please try again.',
        });
      }
      setTimeout(() => setWishlistToast(null), 3500);
    } finally {
      setIsSavingWishlist(false);
    }
  };

  const isAddingToCart = !!itemLoading?.[id];
  const inCart = isItemInCart ? isItemInCart(id) : false;
  const cartQty = getItemQuantity ? getItemQuantity(id) : 0;

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || isAddingToCart) return;
    const res = await addToCart(id);
    if (res.success) {
      setCartToast({ type: 'success', text: `✨ "${product.name}" added to cart!` });
    } else {
      setCartToast({ type: 'error', text: res.message || 'Could not add to cart' });
    }
    setTimeout(() => {
      setCartToast(null);
    }, 3500);
  };

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><rect fill="%23f1f5f9" width="500" height="500"/><text fill="%2394a3b8" font-family="sans-serif" font-size="20" dy="10.5" font-weight="600" x="50%" y="50%" text-anchor="middle">Image Not Available</text></svg>';

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.mainContainer}>
        {/* Navigation Breadcrumb */}
        <nav style={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/products" style={styles.breadcrumbLink}>
            ← Back to Products
          </Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>
            {product?.name ? product.name.slice(0, 35) + '...' : 'Product Details'}
          </span>
        </nav>

        {/* 1. LOADING STATE */}
        {isLoading && (
          <div id="details-loading-state" style={styles.stateContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.stateHeading}>Loading product details...</h2>
            <p style={styles.stateSub}>Fetching specifications from MongoDB.</p>
          </div>
        )}

        {/* 2. ERROR / NOT FOUND STATE */}
        {!isLoading && errorMessage && (
          <div id="details-error-state" style={styles.errorCard}>
            <span style={styles.errorIcon}>⚠️</span>
            <h2 style={styles.errorTitle}>Product Not Found</h2>
            <p style={styles.errorDesc}>{errorMessage}</p>
            <button onClick={() => navigate('/products')} style={styles.backCatalogBtn}>
              Return to Catalog
            </button>
          </div>
        )}

        {/* 3. PRODUCT SHOWCASE PRESENTATION */}
        {!isLoading && !errorMessage && product && (
          <div id="product-details-content" style={styles.detailsGrid}>
            {/* Left Column: Product Image Showcase */}
            <div style={styles.imageCard}>
              <div style={styles.imageFrame}>
                <img
                  src={imageError ? fallbackImage : product.image}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  style={styles.image}
                />
              </div>
            </div>

            {/* Right Column: Specifications & Purchasing Controls */}
            <div style={styles.infoCard}>
              <div style={styles.categoryRow}>
                <span style={styles.categoryBadge}>{product.category}</span>
                <span style={styles.idBadge}>ID: {product._id}</span>
              </div>

              <h1 style={styles.productTitle}>{product.name}</h1>

              {/* Price Display */}
              <div style={styles.priceRow}>
                <span style={styles.priceAmount}>
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </span>
                <span style={styles.taxNote}>Inclusive of all applicable taxes</span>
              </div>

              {/* Stock Inventory Status */}
              <div style={styles.stockStatusRow}>
                {product.stock > 0 ? (
                  <div style={styles.inStockBanner}>
                    <span style={styles.stockDotGreen}></span>
                    <span style={styles.stockText}>
                      In Stock & Ready to Ship (<strong>{product.stock} units available</strong>)
                    </span>
                  </div>
                ) : (
                  <div style={styles.outOfStockBanner}>
                    <span style={styles.stockDotRed}></span>
                    <span style={styles.stockTextRed}>Currently Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div style={styles.descriptionSection}>
                <h3 style={styles.descriptionHeading}>About this product</h3>
                <p style={styles.descriptionText}>{product.description}</p>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionRow}>
                <button
                  id="add-to-cart-button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isAddingToCart || cartQty >= product.stock}
                  style={{
                    ...styles.addToCartBtn,
                    opacity: product.stock <= 0 || isAddingToCart || cartQty >= product.stock ? 0.6 : 1,
                    cursor:
                      product.stock <= 0 || isAddingToCart || cartQty >= product.stock
                        ? 'not-allowed'
                        : 'pointer',
                    backgroundColor: inCart ? '#059669' : '#4f46e5',
                  }}
                >
                  {isAddingToCart
                    ? 'Adding...'
                    : product.stock <= 0
                    ? 'Out of Stock'
                    : inCart
                    ? cartQty >= product.stock
                      ? 'Max Stock in Cart'
                      : `+ Add Another (${cartQty} in cart)`
                    : '🛒 Add to Cart'}
                </button>

                <button
                  id="wishlist-detail-btn"
                  onClick={handleToggleWishlist}
                  disabled={isSavingWishlist}
                  style={{
                    ...styles.wishlistToggleBtn,
                    backgroundColor: isWishlisted ? '#fff1f2' : '#ffffff',
                    color: isWishlisted ? '#e11d48' : '#334155',
                    borderColor: isWishlisted ? '#fda4af' : '#cbd5e1',
                    opacity: isSavingWishlist ? 0.7 : 1,
                    cursor: isSavingWishlist ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingWishlist
                    ? '⏳ Saving...'
                    : isWishlisted
                    ? '♥ Saved to Wishlist'
                    : '♡ Add to Wishlist'}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  style={styles.continueShoppingBtn}
                >
                  Continue Shopping
                </button>
              </div>

              {/* Wishlist Feedback Toast */}
              {wishlistToast && (
                <div
                  id="wishlist-toast"
                  style={{
                    ...styles.cartToast,
                    backgroundColor:
                      wishlistToast.type === 'error'
                        ? '#fef2f2'
                        : wishlistToast.type === 'info'
                        ? '#f0f9ff'
                        : '#fdf2f8',
                    borderColor:
                      wishlistToast.type === 'error'
                        ? '#fecaca'
                        : wishlistToast.type === 'info'
                        ? '#bae6fd'
                        : '#fbcfe8',
                    color:
                      wishlistToast.type === 'error'
                        ? '#991b1b'
                        : wishlistToast.type === 'info'
                        ? '#0369a1'
                        : '#be185d',
                  }}
                >
                  {wishlistToast.text}
                </div>
              )}

              {/* Cart Feedback Toast */}
              {cartToast && (
                <div
                  id="cart-toast"
                  style={{
                    ...styles.cartToast,
                    backgroundColor: cartToast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: cartToast.type === 'error' ? '#991b1b' : '#166534',
                    borderColor: cartToast.type === 'error' ? '#fecaca' : '#bbf7d0',
                  }}
                >
                  {cartToast.text}
                </div>
              )}
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
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  mainContainer: {
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 80px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  breadcrumbLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    color: '#cbd5e1',
  },
  breadcrumbCurrent: {
    color: '#64748b',
    fontWeight: '500',
  },
  stateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '80px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '4px solid #e2e8f0',
    borderTopColor: '#4f46e5',
    animation: 'spin 0.9s linear infinite',
    marginBottom: '18px',
  },
  stateHeading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  stateSub: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
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
    fontSize: '22px',
    fontWeight: '700',
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  errorDesc: {
    fontSize: '15px',
    color: '#7f1d1d',
    margin: '0 0 24px 0',
    maxWidth: '460px',
  },
  backCatalogBtn: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '36px',
    alignItems: 'start',
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
  },
  imageFrame: {
    width: '100%',
    height: '380px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '36px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid #c7d2fe',
  },
  idBadge: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  productTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.5px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  priceAmount: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: '-0.5px',
  },
  taxNote: {
    fontSize: '12px',
    color: '#64748b',
  },
  stockStatusRow: {
    margin: '2px 0',
  },
  inStockBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '10px 16px',
    borderRadius: '10px',
  },
  stockDotGreen: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
  },
  stockText: {
    fontSize: '13px',
    color: '#166534',
    fontWeight: '500',
  },
  outOfStockBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '10px 16px',
    borderRadius: '10px',
  },
  stockDotRed: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  stockTextRed: {
    fontSize: '13px',
    color: '#991b1b',
    fontWeight: '600',
  },
  descriptionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  descriptionHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  descriptionText: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#475569',
    margin: 0,
  },
  actionRow: {
    display: 'flex',
    gap: '14px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  addToCartBtn: {
    flex: '1 1 200px',
    padding: '14px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
  },
  continueShoppingBtn: {
    padding: '14px 22px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  wishlistToggleBtn: {
    padding: '14px 22px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  cartToast: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#15803d',
    padding: '12px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    animation: 'fadeIn 0.3s ease',
  },
  cartNote: {
    fontSize: '11px',
    color: '#166534',
    opacity: 0.8,
  },
};
