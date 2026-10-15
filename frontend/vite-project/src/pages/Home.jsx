import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';


export default function Home() {
  const { user: customer } = useAuth();

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.heroBanner}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>✨ Verified Customer</span>
            <h1 style={styles.welcomeHeading}>
              Welcome back, <span style={styles.accentName}>{customer?.fullName || 'Shopper'}</span>!
            </h1>
            <p style={styles.heroSubtitle}>
              Explore exclusive deals and manage your ShopKart account settings from your dashboard.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link
                to="/products"
                id="hero-explore-products-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  color: '#4f46e5',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                }}
              >
                🛍️ Browse Products Catalog →
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.profileSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Customer Information</h2>
            <span style={styles.statusPill}>Active Session</span>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.infoCard}>
              <div style={styles.iconCircle}>👤</div>
              <div style={styles.cardTextGroup}>
                <span style={styles.cardLabel}>Full Name</span>
                <span style={styles.cardValue} id="customer-name">{customer?.fullName}</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.iconCircle}>✉️</div>
              <div style={styles.cardTextGroup}>
                <span style={styles.cardLabel}>Email Address</span>
                <span style={styles.cardValue} id="customer-email">{customer?.email}</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.iconCircle}>📱</div>
              <div style={styles.cardTextGroup}>
                <span style={styles.cardLabel}>Phone Number</span>
                <span style={styles.cardValue} id="customer-phone">{customer?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.iconCircle}>🔒</div>
              <div style={styles.cardTextGroup}>
                <span style={styles.cardLabel}>Auth Method</span>
                <span style={styles.cardValue}>HttpOnly JWT Cookie</span>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.activitySection}>
          <h2 style={styles.sectionTitle}>ShopKart Overview</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Pending Orders</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>12</span>
              <span style={styles.statLabel}>Wishlist Items</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>₹ 500</span>
              <span style={styles.statLabel}>Wallet Balance</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>Gold</span>
              <span style={styles.statLabel}>Tier Membership</span>
            </div>
          </div>
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
  main: {
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 64px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  heroBanner: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '20px',
    padding: '40px 36px',
    color: '#ffffff',
    boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.25)',
  },
  heroContent: {
    maxWidth: '700px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  welcomeHeading: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 12px 0',
    lineHeight: 1.2,
    color: '#ffffff',
  },
  accentName: {
    color: '#fef08a',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#e0e7ff',
    margin: 0,
    lineHeight: 1.5,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  statusPill: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  iconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  cardTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '2px',
  },
  cardValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activitySection: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '20px',
  },
  statCard: {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4f46e5',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
};