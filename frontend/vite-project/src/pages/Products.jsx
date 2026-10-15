

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/productService';
import { getWishlist } from '../services/wishlistService';

export default function Products() {
  // State for products and catalog metadata
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Filter and Query States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');

  // Three Crucial UI States: Loading, Error, Empty
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Debounce search input by 350ms to prevent excessive backend queries
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchInput]);

  // Master fetch function coordinating with backend GET /products?search=&category=&sort=
  const fetchProductCatalog = useCallback(async () => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getProducts({
        search: debouncedSearch,
        category,
        sort,
      });

      if (isMounted) {
        if (data.success) {
          setProducts(data.products || []);

          // Dynamically extract unique categories if not yet initialized
          if (categories.length === 0 && data.products) {
            const extractedCategories = Array.from(
              new Set(data.products.map((p) => p.category).filter(Boolean))
            ).sort();
            setCategories(extractedCategories);
          }
        } else {
          setErrorMessage(data.message || 'Failed to fetch catalog.');
        }

        // Fetch current wishlist items to sync saved states
        try {
          const wl = await getWishlist();
          if (wl.success && Array.isArray(wl.wishlist)) {
            const ids = new Set(wl.wishlist.map((item) => (item._id || item).toString()));
            setWishlistIds(ids);
          }
        } catch (e) {
          // Non-blocking
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error('API Error in Products.jsx:', err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            'Something went wrong while loading products. Please check your network connection.'
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
  }, [debouncedSearch, category, sort, categories.length]);

  // Trigger fetch on mount and whenever search, category, or sort changes
  useEffect(() => {
    fetchProductCatalog();
  }, [fetchProductCatalog]);

  // Reset all filters to default state
  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('all');
    setSort('');
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.mainContainer}>
        {/* Header Hero Banner */}
        <header style={styles.header}>
          <div>
            <span style={styles.headerBadge}>🛍️ Live Catalog</span>
            <h1 style={styles.heading}>Explore ShopKart Products</h1>
            <p style={styles.subheading}>
              Discover electronics, fashion, and accessories with real-time backend search and filtering.
            </p>
          </div>
        </header>

        {/* Discovery Search and Filter Toolbar (Task 7) */}
        <section aria-label="Search and Filter Controls">
          <SearchBar
            search={searchInput}
            category={category}
            sort={sort}
            categories={categories}
            onSearchChange={setSearchInput}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onResetFilters={handleResetFilters}
            totalResults={products.length}
          />
        </section>

        {/* Dynamic Presentation Area: Loading, Error, Empty, or Product Grid */}
        <section style={styles.contentSection} aria-live="polite">
          {/* 1. LOADING STATE */}
          {isLoading && (
            <div id="loading-state" style={styles.stateCard}>
              <div style={styles.spinner}></div>
              <h3 style={styles.stateTitle}>Loading products...</h3>
              <p style={styles.stateDesc}>Fetching the latest catalog items from MongoDB.</p>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {!isLoading && errorMessage && (
            <div id="error-state" style={styles.errorCard}>
              <div style={styles.errorIcon}>⚠️</div>
              <h3 style={styles.errorTitle}>Something went wrong while loading products.</h3>
              <p style={styles.errorDesc}>{errorMessage}</p>
              <button id="retry-fetch-btn" onClick={fetchProductCatalog} style={styles.retryBtn}>
                🔄 Try Again
              </button>
            </div>
          )}

          {/* 3. EMPTY STATE */}
          {!isLoading && !errorMessage && products.length === 0 && (
            <div id="empty-state" style={styles.stateCard}>
              <div style={styles.emptyIcon}>🔍</div>
              <h3 style={styles.stateTitle}>No products found.</h3>
              <p style={styles.stateDesc}>
                We couldn't find any products matching your search criteria. Try checking for typos
                or clearing selected filters.
              </p>
              <button id="clear-filters-btn" onClick={handleResetFilters} style={styles.resetBtn}>
                Clear All Filters
              </button>
            </div>
          )}

          {/* 4. SUCCESS STATE: DYNAMIC PRODUCT GRID (Task 6) */}
          {!isLoading && !errorMessage && products.length > 0 && (
            <div id="products-grid" style={styles.grid}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialWishlisted={wishlistIds.has(product._id?.toString())}
                  onWishlistChange={(id, isSaved) => {
                    setWishlistIds((prev) => {
                      const next = new Set(prev);
                      if (isSaved) next.add(id.toString());
                      else next.delete(id.toString());
                      return next;
                    });
                  }}
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
  },
  headerBadge: {
    display: 'inline-block',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '10px',
    border: '1px solid #c7d2fe',
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
    maxWidth: '650px',
    lineHeight: 1.5,
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
    borderTopColor: '#4f46e5',
    animation: 'spin 0.9s linear infinite',
    marginBottom: '18px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
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
    margin: '0 0 20px 0',
    lineHeight: 1.5,
  },
  resetBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorCard: {
    backgroundColor: '#fff5f5',
    borderRadius: '16px',
    border: '1px solid #fecaca',
    padding: '50px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: '42px',
    marginBottom: '12px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  errorDesc: {
    fontSize: '14px',
    color: '#7f1d1d',
    maxWidth: '500px',
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
};
